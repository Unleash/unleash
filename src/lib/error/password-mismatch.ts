import BaseError from './base-error';

class PasswordMismatch extends BaseError {
    constructor(message: string = 'Wrong password, try again.') {
        super(message, 401, 'PasswordMismatch');
        Error.captureStackTrace(this, this.constructor);
    }
}

export default PasswordMismatch;
