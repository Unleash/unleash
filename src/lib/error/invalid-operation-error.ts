import { UnleashError } from './api-error';

class InvalidOperationError extends UnleashError {
    constructor(message: string) {
        super({ message, name: 'InvalidOperationError' });
    }
}
export default InvalidOperationError;
module.exports = InvalidOperationError;
