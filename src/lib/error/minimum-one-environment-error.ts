import { UnleashError } from './api-error';

class MinimumOneEnvironmentError extends UnleashError {
    constructor(message: string) {
        super({ message, name: 'MinimumOneEnvironmentError' });
    }
}
export default MinimumOneEnvironmentError;
module.exports = MinimumOneEnvironmentError;
