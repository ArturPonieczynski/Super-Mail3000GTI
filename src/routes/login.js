import Router from 'express';
import {ValidationError} from "../utils/error.js";
import {config} from "../config.js";

export const loginRouter = Router();

loginRouter.post('/', (req, res) => {
    if (req.body.name !== config.MOCKUP_USER_NAME) {
        throw new ValidationError('Nieprawidłowa nazwa użytkownika.')
    }
    if (req.body.password !== config.MOCKUP_USER_PASSWORD) {
        throw new ValidationError('Złe hasło.');
    } else {
        res.json({response: true});
    }
})