import { GenericUnleashError } from './unleash-error';
import { EXCEEDS_LIMIT } from '../metric-events';
import type EventEmitter from 'events';

export class ExceedsLimitError extends GenericUnleashError {
    constructor(resource: string, limit: number) {
        super({
            name: 'ExceedsLimitError',
            message: `Failed to create ${resource}. You can't create more than the established limit of ${limit}.`,
            statusCode: 400,
        });
    }
}

type ExceedsLimitErrorData = {
    resource: string;
    limit: number;
    resourceNameOverride?: string;
};

export const throwExceedsLimitError = (
    eventBus: EventEmitter,
    { resource, limit, resourceNameOverride }: ExceedsLimitErrorData,
) => {
    eventBus.emit(EXCEEDS_LIMIT, {
        resource: resourceNameOverride ?? resource,
        limit,
    });
    throw new ExceedsLimitError(resource, limit);
};
