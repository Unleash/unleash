import { GenericUnleashError } from './unleash-error';

export class ExeedsLimitError extends GenericUnleashError {
    constructor(resource: string, limit: number) {
        super({
            name: 'ValidationError', // it can also be 'OperationDeniedError' or we can create a new one
            message: `Failed to create ${resource}. You can't create more than the established limit of ${limit}.`,
            statusCode: 400,
        });
    }
}
