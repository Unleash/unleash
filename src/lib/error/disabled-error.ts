import { UnleashError } from './api-error';

class DisabledError extends UnleashError {
    constructor(message: string) {
        super({ message, name: 'DisabledError' });
    }
}

export default DisabledError;
