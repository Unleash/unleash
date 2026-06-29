import { beforeEach, expect, test, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import type { UserAccessRequestSchema } from 'openapi';
import { EventTrackerContext } from 'contexts/EventTrackerContext';
import { NotificationStack } from './NotificationStack';

const storageKey = 'test:access-requests:dismissed';

const request = (id: string, requestedAt: string): UserAccessRequestSchema => ({
    id,
    email: `${id}@example.com`,
    requestedAt,
});

beforeEach(() => {
    window.localStorage.clear();
});

test('sorts newest first, caps to maxVisible, and persists dismissals', async () => {
    const requests = [
        request('a', '2026-06-20T00:00:00Z'),
        request('b', '2026-06-22T00:00:00Z'),
        request('c', '2026-06-24T00:00:00Z'),
    ];

    const { unmount } = render(
        <NotificationStack
            accessRequests={requests}
            storageKey={storageKey}
            maxVisible={2}
        />,
    );

    // Newest two are shown, oldest is capped out
    expect(await screen.findByText('c@example.com')).toBeInTheDocument();
    expect(screen.getByText('b@example.com')).toBeInTheDocument();
    expect(screen.queryByText('a@example.com')).not.toBeInTheDocument();

    await userEvent.click(
        screen.getByRole('button', {
            name: 'Dismiss notification for c@example.com',
        }),
    );

    // After dismissing c, b and a should be visible (a was previously capped)
    expect(screen.queryByText('c@example.com')).not.toBeInTheDocument();
    expect(screen.getByText('b@example.com')).toBeInTheDocument();
    expect(screen.getByText('a@example.com')).toBeInTheDocument();

    // Remount: dismissal survives because it is persisted
    unmount();
    render(
        <NotificationStack
            accessRequests={requests}
            storageKey={storageKey}
            maxVisible={2}
        />,
    );

    expect(await screen.findByText('b@example.com')).toBeInTheDocument();
    expect(screen.getByText('a@example.com')).toBeInTheDocument();
    expect(screen.queryByText('c@example.com')).not.toBeInTheDocument();
});

test('tracks view and dismiss clicks', async () => {
    const trackEvent = vi.fn();

    render(
        <EventTrackerContext.Provider value={{ trackEvent }}>
            <NotificationStack
                accessRequests={[request('a', '2026-06-20T00:00:00Z')]}
                storageKey={storageKey}
            />
        </EventTrackerContext.Provider>,
    );

    await userEvent.click(
        await screen.findByRole('link', { name: 'View request' }),
    );
    expect(trackEvent).toHaveBeenCalledWith('access-requests-notification', {
        props: { eventType: 'view-click' },
    });

    await userEvent.click(
        screen.getByRole('button', {
            name: 'Dismiss notification for a@example.com',
        }),
    );
    expect(trackEvent).toHaveBeenCalledWith('access-requests-notification', {
        props: { eventType: 'dismiss-click' },
    });
});
