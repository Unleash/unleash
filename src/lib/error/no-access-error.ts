import { UnleashError } from './api-error';

class NoAccessError extends UnleashError {
    constructor(permission: string, environment?: string) {
        const message =
            `You don't have the required permissions to perform this operation. You need the "${permission}" permission to perform this action` +
            (environment ? ` in the "${environment}" environment.` : `.`);

        super({
            name: 'NoAccessError',
            message,
            permission,
        });
    }
}

export default NoAccessError;
module.exports = NoAccessError;
