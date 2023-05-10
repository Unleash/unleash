import { UnleashError } from './api-error';

class PasswordMismatch extends UnleashError {
    constructor(message: string = 'Wrong password, try again.') {
        super(message);
    }
}

export default PasswordMismatch;
