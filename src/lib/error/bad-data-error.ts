import { UnleashError } from './api-error';

class BadDataError extends UnleashError {
    constructor(message: string) {
        super({
            message,
            name: 'BadDataError',
            details: [
                {
                    message,
                    description: message,
                },
            ],
        });
    }
}

export default BadDataError;
