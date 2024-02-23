import {Router} from 'express';
import {NotFoundError, ServerError} from "../utils/error.js";
import jwt from "jsonwebtoken";
import {config} from "../config.js";
import passport from "passport";

const {JWT_SECRET, JWT_EXPIRES_ACCESS} = config;

export const loginRouter = Router();

loginRouter.post('/', (req, res, next) => {

    passport.authenticate('local', {session: false}, (error, user, info) => {
        if (error) {
            return next(error);
        }
        if (!user) {
            throw new NotFoundError('Nieprawidłowe dane logowania.');
        }
        req.login(user, {session: false}, (loginErr) => {
            if (loginErr) {
                return next(loginErr);
            }

            const token = jwt.sign(
                {
                    sub: user.id,
                    name: user.name,
                },
                JWT_SECRET,
                {expiresIn: JWT_EXPIRES_ACCESS}
            );

            res.cookie('jwt', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
            });

            res.json({
                ok: true,
            });

        });
    })(req, res, next);
});

