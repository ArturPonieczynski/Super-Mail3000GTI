import {Router} from "express";
import {upload} from "../utils/multer.js";
import {MemberRecord} from "../records/member.record.js";
import {ValidationError} from "../utils/error.js";
import {EmailService} from "../services/email.service.js";

export const mailRouter = Router();

mailRouter.get('/all', async (req, res) => {
    try {
        const memberList = await MemberRecord.findAll();
        res.json(memberList);
    } catch (err) {
        throw new ValidationError('Błąd podczas ładowania książki adresów.')
    }
});

mailRouter.post('/', upload.single('file'), (req, res) => {
    try {
        EmailService.sendMailService(req);
        res.json({ok: true});
    } catch (err) {
        throw new ValidationError('Błąd wysyłania email-a.');
    }
});
