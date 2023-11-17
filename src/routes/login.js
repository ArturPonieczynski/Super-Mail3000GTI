import Router from 'express';
import {ValidationError} from "../utils/error.js";
import {config} from "../config.js";

export const loginRouter = Router();

loginRouter.post('/', (req, res) => {
    if (req.body.name !== config.MOCKUP_USER_NAME) {
        res.json({login: 'Zła nazwa użytkownika.'})
        throw new ValidationError('Zła nazwa użytkownika.')
    }
    if (req.body.password !== config.MOCKUP_USER_PASSWORD) {
        res.json({login: 'Złe hasło.'})
        throw new ValidationError('Złe hasło.')
    }
    res.json({login: 'ok'});
})