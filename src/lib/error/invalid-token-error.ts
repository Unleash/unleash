import { UnleashError } from './unleash-error.js';

class InvalidTokenError extends UnleashError {
    statusCode = 401;

    constructor() {
        super('Token was not valid');
    }
}

export default InvalidTokenError;
