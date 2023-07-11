import { UnleashError } from './unleash-error';

class NotFoundError extends UnleashError {
    statusCode = 404;

    constructor(message: string = 'The requested resource could not be found') {
        super(message);
    }
}
export default NotFoundError;
module.exports = NotFoundError;
