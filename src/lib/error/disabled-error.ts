import BaseError from './base-error';

class DisabledError extends BaseError {
    constructor(message: string) {
        super(message, 422, 'DisabledError');
        Error.captureStackTrace(this, this.constructor);
    }
}

export default DisabledError;
