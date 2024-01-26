import {Router} from 'express';
import {NotFoundError, ServerError} from "../utils/error.js";
import {UserRecord} from "../records/user.record.js";
import {compare} from "bcrypt";

export const loginRouter = Router();

loginRouter.post('/', async (req, res) => {
    try {
        const user = await UserRecord.findOneByName(req.body.name);

        if (!user) {
            throw new NotFoundError('Nieprawidłowe dane logowania.');
        } else {
            const isMatch = await compare(req.body.password, user.passwordHash);
            if (!isMatch) {
                throw new NotFoundError('Nieprawidłowe dane logowania.');
            } else {
                res.json({ok: true});
            }
        }
    } catch (error) {
        console.error('Error occurred on path POST /api/login.', error);
        throw new ServerError(`Nie udało się zalogować. ${error.message}`, error);
    }
});
