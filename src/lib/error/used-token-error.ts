import { UnleashError } from './api-error';

class UsedTokenError extends UnleashError {
    constructor(usedAt: Date) {
        super({
            message: `Token was already used at ${usedAt}`,
            name: 'UsedTokenError',
        });
    }
}

export default UsedTokenError;
module.exports = UsedTokenError;
