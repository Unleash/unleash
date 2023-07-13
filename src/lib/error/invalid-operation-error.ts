import { UnleashError } from './unleash-error';

class InvalidOperationError extends UnleashError {
    statusCode = 403;
}
export default InvalidOperationError;
module.exports = InvalidOperationError;
