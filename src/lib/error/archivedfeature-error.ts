import { UnleashError } from './unleash-error';

class ArchivedFeatureError extends UnleashError {
    statusCode = 400;

    constructor(
        message: string = 'Cannot perform this operation on archived features',
    ) {
        super(message);
    }
}
export default ArchivedFeatureError;
module.exports = ArchivedFeatureError;
