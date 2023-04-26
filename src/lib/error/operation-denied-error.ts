import { UnleashError } from './api-error';

export class OperationDeniedError extends UnleashError {
    constructor(message: string) {
        super({ message, name: 'OperationDeniedError' });
    }
}
