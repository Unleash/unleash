import { UnleashError } from './api-error';

class RoleInUseError extends UnleashError {
    constructor(message: string) {
        super({ message, name: 'RoleInUseError' });
    }
}

export default RoleInUseError;
