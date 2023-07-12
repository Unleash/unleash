import { UnleashError } from './unleash-error';

class InvalidOperationError extends UnleashError {
    statusCode = 400;
}
export default InvalidOperationError;
module.exports = InvalidOperationError;
