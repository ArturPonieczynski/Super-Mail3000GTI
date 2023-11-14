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
    const {mailTo, subject, text, date, time} = req.body;

    const timeToSend = new Date(`${date} ${time}`).getTime();
    const delay = timeToSend - (new Date().getTime());

    const mailData = {
        from: config.EMAIL_SEND_FROM_SMTP,
        to: mailTo,
        cc: "",
        bcc: "",
        subject: subject,
        text: text,
        // html: '',
    };

    const selfMailData = {
        ...mailData,
        to: 'art.pon.sc@gmail.com', // @TODO Change it to config data
    };

    if (req.file) {
        mailData.attachments = [{path: req.file.path},];
        selfMailData.attachments = [{path: req.file.path},];
    }

    setTimeout(() => {
        try {
            transporter
                .sendMail(mailData)
                .then((mailObject) => {
                    const {accepted, rejected} = mailObject;
                    selfMailData.text = `##### Wiadomość wysłana do: ${accepted}  #####\n\n` + text;

                    transporter.sendMail(selfMailData);

                    console.log('response from sendmail [Accepted] [Rejected]: ', accepted, rejected);
                    // req.session.data = 'test'; @TODO not working for now, if it won't be use, uninstall express-session.
                    // res.redirect(`/?accepted="${accepted}"&rejected="${rejected}"`); // @TODO Think about safer way.
                    // res.redirect('/'); // @TODO Think about safer way.
                });
        } catch (error) {
            console.log(error);
        }
    }, delay);

    res.redirect('/');
});