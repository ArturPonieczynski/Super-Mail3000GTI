import {homeRouter} from "../routes/home.mjs";

export class ValidationError extends Error {}

export const validationError = (err, req, res, next) => {
    if (err instanceof NotFoundError) {
        res
            .status(404)
            .render('error', {message: 'There is no... (?)'});
        return
    }

    console.error(err);
    res.status(err instanceof ValidationError ? 400 : 500).redirect(homeRouter);
};