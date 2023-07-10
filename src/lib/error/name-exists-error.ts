import { UnleashError } from './unleash-error';

class NameExistsError extends UnleashError {
    statusCode = 409;
}
export default NameExistsError;
module.exports = NameExistsError;
