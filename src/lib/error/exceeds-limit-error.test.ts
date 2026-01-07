import type EventEmitter from 'events';
import { EXCEEDS_LIMIT } from '../metric-events.js';
import {
    ExceedsLimitError,
    throwExceedsLimitError,
} from './exceeds-limit-error.js';

import { vi, it, expect } from 'vitest';

it('emits events event when created through the external function', () => {
    const emitEvent = vi.fn();
    const resource = 'some-resource';
    const limit = 10;

    expect(() =>
        throwExceedsLimitError(
            {
                emit: emitEvent,
            } as unknown as EventEmitter,
            {
                resource,
                limit,
            },
        ),
    ).toThrow(ExceedsLimitError);

    expect(emitEvent).toHaveBeenCalledWith(EXCEEDS_LIMIT, {
        resource,
        limit,
    });
});

it('emits uses the resourceNameOverride for the event when provided, but uses the resource for the error', () => {
    const emitEvent = vi.fn();
    const resource = 'not this';
    const resourceNameOverride = 'but this!';
    const limit = 10;

    expect(() =>
        throwExceedsLimitError(
            {
                emit: emitEvent,
            } as unknown as EventEmitter,
            {
                resource,
                resourceNameOverride,
                limit,
            },
        ),
    ).toThrowError(
        expect.errorWithMessage(new ExceedsLimitError(resource, limit)),
    );

    expect(emitEvent).toHaveBeenCalledWith(EXCEEDS_LIMIT, {
        resource: resourceNameOverride,
        limit,
    });
});
