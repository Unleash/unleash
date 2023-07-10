import { UnleashError } from './unleash-error';

class DisabledError extends UnleashError {
    statusCode = 422;
}

export default DisabledError;
