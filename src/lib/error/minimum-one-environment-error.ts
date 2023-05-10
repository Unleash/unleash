import { UnleashError } from './api-error';

class MinimumOneEnvironmentError extends UnleashError {}

export default MinimumOneEnvironmentError;
module.exports = MinimumOneEnvironmentError;
