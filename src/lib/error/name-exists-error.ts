import { UnleashError } from './unleash-error.js';

class NameExistsError extends UnleashError {
    statusCode = 409;
}
export default NameExistsError;
