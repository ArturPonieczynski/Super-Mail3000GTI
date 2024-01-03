import {Router} from "express";
import {upload} from "../utils/multer.js";
import {MemberRecord} from "../records/member.record.js";
import {EmailService} from "../services/email.service.js";

export const mailRouter = Router();

mailRouter.get('/all', async (req, res) => {
    try {
        const memberList = await MemberRecord.findAll();
        res.json(memberList);
    } catch (error) {
        console.error('Error occurred on path GET /api/mail/all', error)
        throw new Error('Błąd podczas ładowania książki adresów.');
    }
});

mailRouter.post('/', upload.single('file'), (req, res) => {
    try {
        EmailService.sendMailService(req);
        res.json({ok: true});
    } catch (error) {
        console.error('Error occurred on path POST /api/mail', error)
        throw new Error('Błąd wysyłania email-a.');
    }
});
