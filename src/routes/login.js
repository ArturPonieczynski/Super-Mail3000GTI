import {Router} from 'express';
import {NotFoundError} from "../utils/error.js";
import {UserRecord} from "../records/user.record.js";
import {compare} from "bcrypt";

export const loginRouter = Router();

loginRouter.post('/', async (req, res, next) => {
    try {
        const user = await UserRecord.findOneByName(req.body.name);
        if (!user) {
            throw new NotFoundError('Nieprawidłowe dane logowania.');
        } else {
            const isMatch = await compare(req.body.password, user.password_hash);
            if (!isMatch) {
                throw new NotFoundError('Nieprawidłowe dane logowania.');
            } else {
                res.json({ok: true});
            }
        }
    } catch (error) {
        console.error(error);
        next(error); // Pass error to middleware for error handling.
    }
});
