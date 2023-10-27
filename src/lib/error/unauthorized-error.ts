import { UnleashError } from './unleash-error';

class UnauthorizedError extends UnleashError {
    statusCode = 401;
}

export default UnauthorizedError;
module.exports = UnauthorizedError;
