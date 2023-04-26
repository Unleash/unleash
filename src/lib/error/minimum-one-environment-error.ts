import { UnleashError } from './api-error';

class MinimumOneEnvironmentError extends UnleashError {
    constructor(message: string) {
        super({
            name: 'MinimumOneEnvironmentError',
            message,
        });
    }
}
export default MinimumOneEnvironmentError;
module.exports = MinimumOneEnvironmentError;
