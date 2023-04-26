import { UnleashError } from './api-error';

class PasswordMismatch extends UnleashError {
    constructor(message: string = 'Wrong password, try again.') {
        super({
            message,
            name: 'PasswordMismatch',
        });
        Error.captureStackTrace(this, this.constructor);
    }
}

export default PasswordMismatch;
