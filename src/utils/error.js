export class ValidationError extends Error {
}

export const handleError = (err, req, res, next) => {
    // if (err instanceof NotFoundError) {
    //     res
    //         .status(404)
    //         .render('error', {message: 'There is no... (?)'});
    //     return;
    // }

    console.error(err);
    res
        .status(err instanceof ValidationError ? 400 : 500)
        .json({
            message: 'error',
            error: err instanceof ValidationError ? err.message : 'Sorry error, try again later.',
        });
};