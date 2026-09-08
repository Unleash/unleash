import { expect, test } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import {
    EventTrackerContext,
    type EventProps,
} from 'contexts/EventTrackerContext';
import type { Tracking } from 'utils/trackingEvents';
import { useTracking } from './useTracking';

const renderTracking = (initial: Tracking | undefined) => {
    const rows: Array<{ event: string } & EventProps> = [];
    const wrapper = ({ children }: { children: ReactNode }) => (
        <EventTrackerContext.Provider
            value={{
                trackEvent: (event, options) =>
                    rows.push({ event, ...options?.props }),
            }}
        >
            {children}
        </EventTrackerContext.Provider>
    );
    const hook = renderHook((tracking) => useTracking(tracking), {
        wrapper,
        initialProps: initial,
    });

    return { rows, ...hook };
};

const roleChanged: Tracking = {
    event: 'project-access',
    type: 'role-changed',
    props: { targetType: 'group' },
};

test('stamps the declaration onto every row of the journey', () => {
    const { rows, result } = renderTracking(roleChanged);

    result.current.track('opened', { rolesCount: 2 });

    expect(rows).toEqual([
        {
            event: 'project-access',
            eventType: 'role-changed',
            action: 'opened',
            targetType: 'group',
            rolesCount: 2,
        },
    ]);
});

test('a successful mutation is tracked as submitted then succeeded', async () => {
    const { rows, result } = renderTracking(roleChanged);

    const value = await result.current.trackMutation(async () => 'saved');

    expect(value).toBe('saved');
    expect(rows.map((row) => row.action)).toEqual(['submitted', 'succeeded']);
});

test('a failed mutation is tracked with the request status and rethrown', async () => {
    const { rows, result } = renderTracking(roleChanged);
    const error = Object.assign(new Error('forbidden'), { statusCode: 403 });

    await expect(
        result.current.trackMutation(async () => {
            throw error;
        }),
    ).rejects.toBe(error);

    expect(rows.map((row) => row.action)).toEqual(['submitted', 'failed']);
    expect(rows[1]).toMatchObject({ failedOn: 'request', errorStatus: 403 });
});

test('a validation failure counts as a submitted attempt', () => {
    const { rows, result } = renderTracking(roleChanged);

    result.current.trackValidationFailed();

    expect(rows.map((row) => row.action)).toEqual(['submitted', 'failed']);
    expect(rows[1]).toMatchObject({ failedOn: 'validation' });
});

test('emits nothing without a declaration but still runs the mutation', async () => {
    const { rows, result } = renderTracking(undefined);

    result.current.track('opened');
    const value = await result.current.trackMutation(async () => 'saved');

    expect(value).toBe('saved');
    expect(rows).toEqual([]);
});

test('later renders reuse the same functions with the latest declaration', () => {
    const { rows, result, rerender } = renderTracking(roleChanged);
    const { track } = result.current;

    rerender({ event: 'feedback' });
    result.current.track('dismissed');

    expect(result.current.track).toBe(track);
    expect(rows).toEqual([{ event: 'feedback', action: 'dismissed' }]);
});
