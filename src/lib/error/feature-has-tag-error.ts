import { UnleashError } from './unleash-error.js';

class FeatureHasTagError extends UnleashError {
    statusCode = 409;
}
export default FeatureHasTagError;
