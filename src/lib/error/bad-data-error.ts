import { ApiErrorSchema, UnleashError } from './api-error';

class BadDataError extends UnleashError {
    details: string[];

    constructor(message: string) {
        super({
            message:
                'Request validation failed: your request body failed to validate. Refer to the `details` list to see what happened.',
            name: 'BadDataError',
            details: [{ description: 'x', message: 'x' }],
        });

        this.details = [message];
    }

    toJSON(): ApiErrorSchema {
        return {
            ...super.toJSON(),
            details: this.details.map((message) => ({
                message,
                description: message,
            })),
        };
    }
}

export default BadDataError;
