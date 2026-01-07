import { UnleashError } from './unleash-error.js';

class ForbiddenError extends UnleashError {
    statusCode = 403;
}

export default ForbiddenError;
