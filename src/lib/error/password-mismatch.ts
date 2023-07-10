import { UnleashError } from './unleash-error';

class PasswordMismatch extends UnleashError {
    statusCode = 401;

    constructor(message: string = 'Wrong password, try again.') {
        super(message);
    }
}

export default PasswordMismatch;
