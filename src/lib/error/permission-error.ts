import { type ApiErrorSchema, UnleashError } from './unleash-error.js';

type Permission = string | string[];

class PermissionError extends UnleashError {
    statusCode = 403;

    permissions: Permission;

    constructor(permission: Permission = [], environment?: string) {
        const permissions = Array.isArray(permission)
            ? permission
            : [permission];

        const permissionsMessage =
            permissions.length === 1
                ? `the "${permissions[0]}" permission`
                : `one of the following permissions: ${permissions
                      .map((perm) => `"${perm}"`)
                      .join(', ')}`;

        const message = `You don't have the required permissions to perform this operation. To perform this action, you need ${permissionsMessage}${
            environment ? ` in the "${environment}" environment.` : `.`
        }`;

        super(message);

        this.permissions = permissions;
    }

    toJSON(): ApiErrorSchema {
        return {
            ...super.toJSON(),
            permissions: this.permissions,
        };
    }
}

export default PermissionError;
