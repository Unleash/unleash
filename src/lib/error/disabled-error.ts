import { UnleashError } from './unleash-error.js';

class DisabledError extends UnleashError {
    statusCode = 422;
}

export default DisabledError;
