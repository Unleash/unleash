import { UnleashError } from './api-error';

class NameExistsError extends UnleashError {
    constructor(message: string) {
        super({ message, name: 'NameExistsError' });
    }
}
export default NameExistsError;
module.exports = NameExistsError;
