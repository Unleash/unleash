class NoAccessError extends Error {
    permission: string;

    name: string;

    message: string;

    environment?: string;

    constructor(permission: string, environment?: string) {
        super();
        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name;
        this.permission = permission;
        this.environment = environment;
        if (environment) {
            this.message = `You need permission=${permission} to perform this action on environment=${environment}`;
        } else {
            this.message = `You need permission=${permission} to perform this action`;
        }
    }

    toJSON(): any {
        return {
            permission: this.permission,
            message: this.message,
        };
    }
}

export default NoAccessError;
module.exports = NoAccessError;
