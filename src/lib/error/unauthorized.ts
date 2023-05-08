import { UnleashError } from './api-error';

class UnauthorizedError extends UnleashError {
    constructor(message: string) {
        super({
            name: 'Unauthorized',
            message,
        });
    }
}

export default UnauthorizedError;
module.exports = UnauthorizedError;
