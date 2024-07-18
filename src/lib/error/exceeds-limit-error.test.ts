import type EventEmitter from 'events';
import { EXCEEDS_LIMIT } from '../metric-events';
import {
    ExceedsLimitError,
    throwExceedsLimitError,
} from './exceeds-limit-error';

it('emits events event when created through the external function', () => {
    const emitEvent = jest.fn();
    const resource = 'some-resource';
    const limit = 10;

    expect(() =>
        throwExceedsLimitError(
            {
                emit: emitEvent,
            } as unknown as EventEmitter,
            resource,
            limit,
        ),
    ).toThrow(ExceedsLimitError);

    expect(emitEvent).toHaveBeenCalledWith(EXCEEDS_LIMIT, {
        resource,
        limit,
    });
});
