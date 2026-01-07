import { UnleashError } from './unleash-error.js';

class InvalidOperationError extends UnleashError {
    statusCode = 403;
}
export default InvalidOperationError;
