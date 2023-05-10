import { UnleashError } from './api-error';

class NameExistsError extends UnleashError {}
export default NameExistsError;
module.exports = NameExistsError;
