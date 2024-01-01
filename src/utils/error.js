export class ValidationError extends Error {}
export class NotFoundError extends Error {}

export const handleError = (error, req, res, next) => {
    if (error instanceof NotFoundError) {
        res
            .status(404)
            .json({
                error: error.message,
            });
        return;
    }

    console.error(error);
    res
        .status(error instanceof ValidationError ? 400 : 500)
        .json({
            error: error instanceof ValidationError ? error.message : 'Sorry error, try again later.',
        });
};