import { UnleashError } from './unleash-error.js';

class NotImplementedError extends UnleashError {
    statusCode = 405;
}

export default NotImplementedError;
