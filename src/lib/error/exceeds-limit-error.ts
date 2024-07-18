import type EventEmitter from 'events';
import { GenericUnleashError } from './unleash-error';
import { EXCEEDS_LIMIT } from '../metric-events';

export class ExceedsLimitError extends GenericUnleashError {
    constructor(resource: string, limit: number, eventBus: EventEmitter) {
        super({
            name: 'ExceedsLimitError',
            message: `Failed to create ${resource}. You can't create more than the established limit of ${limit}.`,
            statusCode: 400,
        });

        eventBus.emit(EXCEEDS_LIMIT, { resource, limit });
    }
}
