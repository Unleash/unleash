import { UnleashError } from './api-error';

class NoAccessError extends UnleashError {
    permission: string;

    message: string;

    environment?: string;

    constructor(permission: string, environment?: string) {
        const message =
            "You don't have the required permissions to perform this operation." +
            environment
                ? `You need the "${permission}" permission to perform this action in the "${environment}" environment.`
                : `You need the "${permission}" permission to perform this action`;

        super({
            name: 'NoAccessError',
            message,
            permission,
        });
        Error.captureStackTrace(this, this.constructor);
    }
}

export default NoAccessError;
module.exports = NoAccessError;
