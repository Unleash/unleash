import { UnleashError } from './unleash-error.js';

class RoleInUseError extends UnleashError {
    statusCode = 400;
}

export default RoleInUseError;
