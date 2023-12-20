import {Router} from "express";
import nodemailer from "nodemailer";
import {upload} from "../utils/multer.js";
import {config} from "../config.js";
import {MemberRecord} from "../records/member.record.js";
import {handleError} from "../utils/error.js";

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

mailRouter.get('/all', async (req, res) => {
    const memberList = await MemberRecord.findAll();
    res.json(memberList);
})

mailRouter.post('/', upload.single('file'), (req, res) => {
    const {mailTo, dw, udw, selectedEmails, subject, text, date, time} = req.body;

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

    const timeToSend = new Date(`${date} ${time}`).getTime();
    const delay = timeToSend - (new Date().getTime());

    const mailData = {
        from: config.EMAIL_SEND_FROM_SMTP,
        to: mailTo ? mailTo + ',' + defaultEmails.join(',') : defaultEmails.join(','),
        cc: dw ? dw + ',' + ccEmails.join(',') : ccEmails.join(','),
        bcc: udw ? udw + ',' + bccEmails.join(',') : bccEmails.join(','),
        subject: subject,
        text: text + "\n\nPozdrawiam\nJerzy Mieńkowski",
        // html: '',
    };

    if (req.file) {
        mailData.attachments = [{path: req.file.path},];
    }

    const selfMailData = {
        ...mailData,
        to: config.APP_ENV === 'production' ? config.EMAIL_SEND_FROM_SMTP : 'art.pon.sc@gmail.com',
        cc: '',
        bcc: '',
    };

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
            selfMailData.text = error;
            await transporter.sendMail(selfMailData);
            handleError(error);
        }
    }, delay);
    res.json({response: true});
});
