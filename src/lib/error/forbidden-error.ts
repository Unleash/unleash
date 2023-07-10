import { ApiErrorSchema, UnleashError } from './unleash-error';

class ForbiddenError extends UnleashError {
    toJSON(): ApiErrorSchema {
        return {
            ...super.toJSON(),
        };
    }
}

export default ForbiddenError;
module.exports = ForbiddenError;
