import {config} from "../config.js";
import {transporter} from "../utils/email.config.js";
import {ValidationError} from "../utils/error.js";
import {getCorrectedDateTime, validateDateTime} from "./date.service.js";
import {isProductionYesNo} from "../utils/is-production.js";

const {
    MAX_SAFE_DELAY_MS,
    EMAIL_SEND_FROM_SMTP,
    APP_DEV_EMAIL,
} = config;

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

    static async sendErrorEmail(rejectedEmail, message) {
        await transporter.sendMail({
            from: EMAIL_SEND_FROM_SMTP,
            to: isProductionYesNo(EMAIL_SEND_FROM_SMTP, APP_DEV_EMAIL),
            subject: 'Error: ' + rejectedEmail,
            text: message,
        });
    }

    static sendEmail(req) {
        const {
            mailTo,
            cc,
            bcc,
            selectedEmails,
            subject,
            text,
            emailFooter,
            date,
            time,
            userTimeZoneOffset,
        } = req.body;

        let selectedEmailsArray = [];

        if (selectedEmails) {
            selectedEmailsArray = JSON.parse(selectedEmails);
        }

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

        selectedEmailsArray.forEach((obj) => {
            if (obj.method === 'default') {
                defaultEmails.push(obj.email);
            } else if (obj.method === 'cc') {
                ccEmails.push(obj.email);
            } else if (obj.method === 'bcc') {
                bccEmails.push(obj.email);
            }
        });

        const emailListInstruction = (email, methodArrayName) => email ? email + ',' + methodArrayName.join(',') : methodArrayName.join(',');

        const mailData = {
            from: EMAIL_SEND_FROM_SMTP,
            to: emailListInstruction(mailTo, defaultEmails),
            cc: emailListInstruction(cc, ccEmails),
            bcc: emailListInstruction(bcc, bccEmails),
            subject: subject,
            text: text + '\n\n' + emailFooter + '\n',
            // html: '',
        };

        if (req.file) {
            mailData.attachments = [{path: req.file.path},];
        }

        const userLocalDateTimeToSend = validateDateTime(date, time, userTimeZoneOffset);
        const delayMs = userLocalDateTimeToSend.getTime() - getCorrectedDateTime(userTimeZoneOffset);

        if (delayMs > MAX_SAFE_DELAY_MS) {
            throw new ValidationError(
                'Zbyt odległy czas zaplanowanej wiadomości. Maksymalny okres planowania to około 28,5 dni. Podaj wcześniejszą datę aby kontynuować.'
            )
        }

        setTimeout(async () => {
            try {
                const sendMailResponse = await transporter.sendMail(mailData);
                const {accepted, rejected, rejectedErrors} = sendMailResponse;

                if (rejected.length > 0) {
                    const emails = rejected.join(', ');
                    const errorInfo = rejectedErrors.toString();
                    await this.sendErrorEmail(emails, errorInfo);
                }

                const selfMailData = {
                    ...mailData,
                    to: isProductionYesNo(EMAIL_SEND_FROM_SMTP, APP_DEV_EMAIL),
                    subject: `Wiadomość do: ${accepted} | ` + subject,
                    cc: '',
                    bcc: '',
                    text: `##### Wiadomość wysłana do: ${accepted} #####\n\n` + mailData.text,
                };

                await transporter.sendMail(selfMailData);

                console.log('Response from nodemailer [Accepted] [Rejected]: ', accepted, rejected);

            } catch (error) {
                const emails = error.rejected.join(', ');
                await this.sendErrorEmail(emails, error.message);
                console.error(error);
            }
        }, delayMs);
    }
}
