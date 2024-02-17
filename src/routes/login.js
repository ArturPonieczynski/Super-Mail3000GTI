import {Router} from 'express';
import {NotFoundError, ServerError} from "../utils/error.js";
import {UserRecord} from "../records/user.record.js";
import {compare} from "bcrypt";
import jwt from "jsonwebtoken";
import {config} from "../config.js";

const {JWT_SECRET, JWT_EXPIRES_ACCESS} = config;

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
                const token = jwt.sign(
                    {
                        sub: user.id,
                        name: user.name,
                    },
                    JWT_SECRET,
                    {expiresIn: JWT_EXPIRES_ACCESS}
                )
                res.json({
                    ok: true,
                    token,
                });
            }
        }
    } catch (error) {
        console.error('Error occurred on path POST /api/login.', error);
        throw new ServerError(`Nie udało się zalogować. ${error.message}`, error);
    }
});
