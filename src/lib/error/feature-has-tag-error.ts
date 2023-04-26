import { UnleashError } from './api-error';

class FeatureHasTagError extends UnleashError {
    constructor(message: string) {
        super({ message, name: 'FeatureHasTagError' });
    }
}
export default FeatureHasTagError;
module.exports = FeatureHasTagError;
