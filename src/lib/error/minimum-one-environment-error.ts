import { UnleashError } from './unleash-error.js';

class MinimumOneEnvironmentError extends UnleashError {
    statusCode = 400;
}

export default MinimumOneEnvironmentError;
