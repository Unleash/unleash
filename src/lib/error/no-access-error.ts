import { ApiErrorSchema } from './api-error';
import { UnleashError } from './api-error';

class NoAccessError extends UnleashError {
    permission: string;

    constructor(permission: string, environment?: string) {
        const message =
            `You don't have the required permissions to perform this operation. You need the "${permission}" permission to perform this action` +
            (environment ? ` in the "${environment}" environment.` : `.`);

        super({
            name: 'NoAccessError',
            message,
            permission,
        });

        this.permission = permission;
    }

    toJSON(): ApiErrorSchema {
        return {
            ...super.toJSON(),
            permission: this.permission,
        };
    }
}

export default NoAccessError;
module.exports = NoAccessError;
