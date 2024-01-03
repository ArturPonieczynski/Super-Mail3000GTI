export class ValidationError extends Error {}

export class NotFoundError extends Error {}

export const handleError = (error, req, res, next) => {
    if (error instanceof NotFoundError) {
        res
            .status(404)
            .json({error: error.message});
    } else if (error instanceof ValidationError) {
        res
            .status(400)
            .json({error: error.message});
    } else {
        console.error(error);
        res
            .status(500)
            .json({error: 'Sorry, an error occurred. Try again later.'});
    }
};
