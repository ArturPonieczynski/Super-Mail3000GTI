import {config} from "../config.js";
import {transporter} from "../utils/email.config.js";
import {ValidationError} from "../utils/error.js";

export class EmailService {

    static validateEmails(input) {
        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        const emails = input.replace(/\s+/g, '').split(',');

        const invalidEmails = emails.filter(email => !emailRegex.test(email));

        return invalidEmails.length <= 0;
    }

    static validateSelectedEmails(input) {
        const invalidEmails = input.filter(obj => !this.validateEmails(obj.email));

        return invalidEmails.length <= 0;
    }

    static sendEmail(req, next) {
        const {
            mailTo,
            cc,
            bcc,
            selectedEmails,
            subject,
            text,
            emailFooter,
            date,
            time
        } = req.body;

        const selectedEmailsArray = JSON.parse(selectedEmails);

        if (
            !mailTo &&
            !cc &&
            !bcc &&
            selectedEmailsArray.length === 0
        ) {
            throw new ValidationError('Nie podano żadnego adresu e-mail.');
        } else if (
            (!(this.validateEmails(mailTo)) && mailTo) ||
            (!(this.validateEmails(cc)) && cc) ||
            (!(this.validateEmails(bcc)) && bcc) ||
            !this.validateSelectedEmails(selectedEmailsArray)
        ) {
            throw new ValidationError('Podano niepoprawny adres e-mail.');
        }

        let defaultEmails = [];
        let ccEmails = [];
        let bccEmails = [];

        selectedEmailsArray.map((obj) => {
            if (obj.method === 'default') {
                defaultEmails.push(obj.email);
            } else if (obj.method === 'cc') {
                ccEmails.push(obj.email);
            } else if (obj.method === 'bcc') {
                bccEmails.push(obj.email);
            }
        });

        const mailData = {
            from: config.EMAIL_SEND_FROM_SMTP,
            to: mailTo ? mailTo + ',' + defaultEmails.join(',') : defaultEmails.join(','),
            cc: cc ? cc + ',' + ccEmails.join(',') : ccEmails.join(','),
            bcc: bcc ? bcc + ',' + bccEmails.join(',') : bccEmails.join(','),
            subject: subject,
            text: text + '\n\n' + emailFooter + '\n',
            // html: '',
        };

        if (req.file) {
            mailData.attachments = [{path: req.file.path},];
        }

        const selfMailData = {
            ...mailData,
            to: config.APP_ENV === 'production' ? config.EMAIL_SEND_FROM_SMTP : config.APP_DEV_EMAIL,
            cc: '',
            bcc: '',
        };

        const timeToSend = new Date(`${date} ${time}`).getTime();
        const delay = timeToSend - Date.now();

        setTimeout(async () => {
            try {
                const temp = await transporter.sendMail(mailData);
                const {accepted, rejected} = temp;
                selfMailData.subject = `Wiadomość do: ${accepted} | ` + subject;
                selfMailData.text = `##### Wiadomość wysłana do: ${accepted}  #####\n\n` + mailData.text;

                await transporter.sendMail(selfMailData);

                console.log('Response from nodemailer [Accepted] [Rejected]: ', accepted, rejected);
            } catch (error) {
                const errorMailData = {...selfMailData};
                errorMailData.text = error;

                try {
                    await transporter.sendMail(errorMailData);
                    next(error);
                } catch (nextError) {
                    next(nextError);
                }
            }
        }, delay);
    }
}
