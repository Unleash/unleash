import { UnleashError } from './api-error';

class NotImplementedError extends UnleashError {
    constructor(message: string) {
        super({
            name: 'NotImplementedError',
            message,
        });
    }
}

export default NotImplementedError;
module.exports = NotImplementedError;
