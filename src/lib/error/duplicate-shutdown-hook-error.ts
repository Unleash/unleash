import { UnleashError } from './unleash-error';

export class DuplicateShutdownHookError extends UnleashError {
    statusCode = 500;
    constructor(serviceName: string) {
        super(`${serviceName} already registered for graceful shutdown`);
    }
}
