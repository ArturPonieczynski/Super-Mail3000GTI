import {Router} from "express";
import nodemailer from "nodemailer";
import {upload} from "../utils/multer.js";
import {config} from "../config.js";

export const mailRouter = Router();

const {HOST_SMTP, PORT_SMTP, USER_NAME_SMTP, USER_PASSWORD_SMTP} = config;

const mailTransporterConfiguration = {
    host: HOST_SMTP,
    port: PORT_SMTP,
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: USER_NAME_SMTP,
        pass: USER_PASSWORD_SMTP,
    },
};

let transporter = nodemailer.createTransport(mailTransporterConfiguration);

mailRouter.post('/', upload.single('file'), (req, res) => {
    const {mailTo, dw, udw, subject, text, date, time} = req.body;

    const timeToSend = new Date(`${date} ${time}`).getTime();
    const delay = timeToSend - (new Date().getTime());

    const mailData = {
        from: config.EMAIL_SEND_FROM_SMTP,
        to: mailTo,
        cc: dw,
        bcc: udw,
        subject: subject,
        text: text + "\n\nPozdrawiam\nJerzy Mieńkowski",
        // html: '',
    };

    const selfMailData = {
        ...mailData,
        to: config.APP_ENV === 'production' ? config.EMAIL_SEND_FROM_SMTP : 'art.pon.sc@gmail.com',
    };

    if (req.file) {
        mailData.attachments = [{path: req.file.path},];
        selfMailData.attachments = [{path: req.file.path},];
    }

    setTimeout(async () => {
        try {
            transporter
                .sendMail(mailData)
                .then((mailObject) => {
                    const {accepted, rejected} = mailObject;
                    selfMailData.subject = `Wiadomość do: ${accepted} | ` + subject;
                    selfMailData.text = `##### Wiadomość wysłana do: ${accepted}  #####\n\n` + text + "\n\nPozdrawiam\nJerzy Mieńkowski";

                    transporter.sendMail(selfMailData);

                    console.log('response from sendmail [Accepted] [Rejected]: ', accepted, rejected);
                });
        } catch (error) {
            console.log(error);
            selfMailData.text = error;
            await transporter.sendMail(selfMailData);
            res.json({error: error});
        }
    }, delay);
    res.json({response: true});
});