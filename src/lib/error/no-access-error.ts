import { ApiErrorSchema, UnleashError } from './unleash-error';

type Permission = string | string[];

class NoAccessError extends UnleashError {
    permission: Permission;

    constructor(permission: Permission = [], environment?: string) {
        const permissions = Array.isArray(permission)
            ? permission
            : [permission];

        const permissionsMessage =
            permissions.length === 1
                ? `the ${permissions[0]} permission`
                : `any of the following permissions: ${permissions.join(', ')}`;

        const message =
            `You don't have the required permissions to perform this operation. You need ${permissionsMessage}" to perform this action` +
            (environment ? ` in the "${environment}" environment.` : `.`);

        super(message);

        this.permission = permissions;
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
