import { UnleashError } from './unleash-error';

class FeatureHasTagError extends UnleashError {
    statusCode = 409;
}
export default FeatureHasTagError;
module.exports = FeatureHasTagError;
