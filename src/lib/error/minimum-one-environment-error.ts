import { UnleashError } from './unleash-error';

class MinimumOneEnvironmentError extends UnleashError {
    statusCode = 400;
}

export default MinimumOneEnvironmentError;
module.exports = MinimumOneEnvironmentError;
