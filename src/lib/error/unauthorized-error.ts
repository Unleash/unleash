import { UnleashError } from './unleash-error.js';

class UnauthorizedError extends UnleashError {
    statusCode = 401;
}

export default UnauthorizedError;
