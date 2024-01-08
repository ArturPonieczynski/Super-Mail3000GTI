export class ValidationError extends Error {
    static statusCode = 400;

    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = ValidationError.statusCode;
    }
}

export class NotFoundError extends Error {
    static statusCode = 404;

    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = NotFoundError.statusCode;
    }
}

export class AccessDeniedError extends Error {
    static statusCode = 403;

    constructor(message) {
        super(message);
        this.name = 'AccessDeniedError';
        this.statusCode = AccessDeniedError.statusCode;
    }
}

export class ServerError extends Error {
    static statusCode = 500;

    constructor(message, originalError = null) {
        super(message);
        this.name = 'ServerError';
        this.originalError = originalError;

        if (originalError instanceof ValidationError) {
            this.statusCode = ValidationError.statusCode;
        } else if (originalError instanceof NotFoundError) {
            this.statusCode = NotFoundError.statusCode;
        } else {
            this.statusCode = ServerError.statusCode;
        }
    }
}

export const handleError = (error, req, res, next) => {
    if (
        error instanceof NotFoundError ||
        error instanceof ValidationError ||
        error instanceof ServerError
    ) {
        res
            .status(error.statusCode)
            .json({error: error.message});
    } else {
        console.error(error);
        res
            .status(500)
            .json({error: 'Sorry, an error occurred. Try again later.'});
    }
};
