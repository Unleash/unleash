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

const editRole: Tracking = {
    event: 'project-access',
    type: 'edit-role',
    props: { targetType: 'group' },
};

test('stamps the declaration onto every row of the journey', () => {
    const { rows, result } = renderTracking(editRole);

    result.current('opened', { rolesCount: 2 });

    expect(rows).toEqual([
        {
            event: 'project-access',
            eventType: 'edit-role',
            action: 'opened',
            targetType: 'group',
            rolesCount: 2,
        },
    ]);
});

test('a successful mutation is tracked as submitted then succeeded', async () => {
    const { rows, result } = renderTracking(editRole);

    const value = await result.current.mutation(async () => 'saved');

    expect(value).toBe('saved');
    expect(rows.map((row) => row.action)).toEqual(['submitted', 'succeeded']);
});

test('a failed mutation is tracked with the request status and rethrown', async () => {
    const { rows, result } = renderTracking(editRole);
    const error = Object.assign(new Error('forbidden'), { statusCode: 403 });

    await expect(
        result.current.mutation(async () => {
            throw error;
        }),
    ).rejects.toBe(error);

    expect(rows.map((row) => row.action)).toEqual(['submitted', 'failed']);
    expect(rows[1]).toMatchObject({ failedOn: 'request', errorStatus: 403 });
});

test('a validation failure counts as a submitted attempt', () => {
    const { rows, result } = renderTracking(editRole);

    result.current.validationFailed();

    expect(rows.map((row) => row.action)).toEqual(['submitted', 'failed']);
    expect(rows[1]).toMatchObject({ failedOn: 'validation' });
});

test('emits nothing without a declaration but still runs the mutation', async () => {
    const { rows, result } = renderTracking(undefined);

    result.current('opened');
    const value = await result.current.mutation(async () => 'saved');

    expect(value).toBe('saved');
    expect(rows).toEqual([]);
});

test('later renders reuse the same tracker with the latest declaration', () => {
    const { rows, result, rerender } = renderTracking(editRole);
    const tracker = result.current;

    rerender({ event: 'feedback', type: 'send-feedback' });
    result.current('dismissed');

    expect(result.current).toBe(tracker);
    expect(rows).toEqual([
        { event: 'feedback', eventType: 'send-feedback', action: 'dismissed' },
    ]);
});
