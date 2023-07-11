import { UnleashError } from './unleash-error';

class NotImplementedError extends UnleashError {
    statusCode = 405;
}

export default NotImplementedError;
module.exports = NotImplementedError;
