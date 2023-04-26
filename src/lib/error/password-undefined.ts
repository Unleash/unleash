import { UnleashError } from './api-error';

export default class PasswordUndefinedError extends UnleashError {
    constructor() {
        super({
            message: 'Password cannot be empty or undefined',
            name: 'PasswordUndefinedError',
        });
    }

    additionalSerializedProps(): object {
        return {
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
