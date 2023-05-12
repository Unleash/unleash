import { UnleashError } from './unleash-error';

class UsedTokenError extends UnleashError {
    constructor(usedAt: Date) {
        super(`Token was already used at ${usedAt}`);
    }
}

export default UsedTokenError;
module.exports = UsedTokenError;
