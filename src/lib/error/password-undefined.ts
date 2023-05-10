import { ApiErrorSchema, UnleashError } from './api-error';

export default class PasswordUndefinedError extends UnleashError {
    constructor() {
        super('Password cannot be empty or undefined');
    }

    toJSON(): ApiErrorSchema {
        return {
            ...super.toJSON(),
            details: [
                {
                    validationErrors: [],
                    message: this.message,
                    description: this.message,
                },
            ],
        };
    }
}
