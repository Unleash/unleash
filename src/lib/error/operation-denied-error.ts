import { UnleashError } from './unleash-error.js';

export class OperationDeniedError extends UnleashError {
    statusCode = 403;
}
