import { UnleashError } from './unleash-error';

export class OperationDeniedError extends UnleashError {
    statusCode = 403;
}
