import { UnleashError } from './api-error';

class NotFoundError extends UnleashError {
    constructor(message?: string) {
        super({
            message: message ?? 'The requested resource could not be found',
            name: 'NotFoundError',
        });
    }
}
export default NotFoundError;
module.exports = NotFoundError;
