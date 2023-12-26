import {config} from "../config.js";
import {transporter} from "../utils/email.config.js";
import {handleError} from "../utils/error.js";

export class EmailService {

    static async sendMailService(req) {
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

        let defaultEmails = [];
        let ccEmails = [];
        let bccEmails = [];

        const selectedEmailsArray = JSON.parse(selectedEmails);

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
        const delay = timeToSend - (new Date().getTime());

        setTimeout(async () => {
            try {
                const temp = await transporter.sendMail(mailData);
                const {accepted, rejected} = temp;
                selfMailData.subject = `Wiadomość do: ${accepted} | ` + subject;
                selfMailData.text = `##### Wiadomość wysłana do: ${accepted}  #####\n\n` + mailData.text;

                await transporter.sendMail(selfMailData);

                console.log('response from sendmail [Accepted] [Rejected]: ', accepted, rejected);
            } catch (error) {
                selfMailData.text = error;
                await transporter.sendMail(selfMailData);
                handleError(error);
            }
        }, delay);
    }
}
