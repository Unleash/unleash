import { GenericUnleashError } from './unleash-error';

export class ExceedsLimitError extends GenericUnleashError {
    constructor(resource: string, limit: number) {
        super({
            name: 'ExceedsLimitError',
            message: `Failed to create ${resource}. You can't create more than the established limit of ${limit}.`,
            statusCode: 400,
        });
    }
}
