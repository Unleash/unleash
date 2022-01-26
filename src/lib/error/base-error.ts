class BaseError extends Error {
    readonly statusCode: number;

    constructor(message: string, statusCode: number, name: string) {
        super();

        this.name = name;
        this.message = message;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON(): object {
        return {
            isJoi: true,
            name: this.constructor.name,
            details: [
                {
                    message: this.message,
                },
            ],
        };
    }
}

export default BaseError;
