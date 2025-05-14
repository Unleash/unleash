import { type ApiErrorSchema, UnleashError } from './unleash-error.js';

export default class PasswordUndefinedError extends UnleashError {
    statusCode = 400;

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
                },
            ],
        };
    }
}
