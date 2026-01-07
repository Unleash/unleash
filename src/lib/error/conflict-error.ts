import { UnleashError } from './unleash-error.js';

class ConflictError extends UnleashError {
    statusCode = 409;
}
export default ConflictError;
