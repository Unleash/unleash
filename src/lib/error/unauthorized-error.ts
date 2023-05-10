import { UnleashError } from './api-error';

class UnauthorizedError extends UnleashError {}

export default UnauthorizedError;
module.exports = UnauthorizedError;
