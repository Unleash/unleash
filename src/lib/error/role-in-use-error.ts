import { UnleashError } from './unleash-error';

class RoleInUseError extends UnleashError {
    statusCode = 400;
}

export default RoleInUseError;
