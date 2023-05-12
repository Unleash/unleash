import { ApiErrorSchema, UnleashError } from './unleash-error';

class NoAccessError extends UnleashError {
    permission: string;

    constructor(permission: string, environment?: string) {
        const message =
            `You don't have the required permissions to perform this operation. You need the "${permission}" permission to perform this action` +
            (environment ? ` in the "${environment}" environment.` : `.`);

        super(message);

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
