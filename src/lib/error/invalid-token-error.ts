import { UnleashError } from './api-error';

class InvalidTokenError extends UnleashError {
    constructor() {
        super({ message: 'Token was not valid', name: 'InvalidTokenError' });
    }
}

export default InvalidTokenError;
module.exports = InvalidTokenError;
