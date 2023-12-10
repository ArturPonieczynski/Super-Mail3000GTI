import Router from 'express';
import {ValidationError} from "../utils/error.js";
import {UserRecord} from "../records/user.record.js";
import {compare} from "bcrypt";

export const loginRouter = Router();

loginRouter.post('/', async (req, res, next) => {
    try {
        const user = await UserRecord.findOneByName(req.body.name);
        if (!user || user.user_name !== req.body.name) {
            throw new ValidationError('Nieprawidłowa nazwa użytkownika.');
        } else {
            const isMatch = await compare(req.body.password, user.password_hash);
            if (!isMatch) {
                throw new ValidationError('Nieprawidłowe hasło.');
            } else {
                res.json({response: true});
            }
        }
    } catch (err) {
        next(err); // Pass error to middleware for error handling.
    }
});
