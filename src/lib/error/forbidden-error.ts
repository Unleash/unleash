import { UnleashError } from './unleash-error';

class ForbiddenError extends UnleashError {
    statusCode = 403;
}

export default ForbiddenError;
module.exports = ForbiddenError;
