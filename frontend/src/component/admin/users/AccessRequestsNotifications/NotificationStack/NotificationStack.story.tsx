import type { Story, StoryMeta } from 'component/stories/types';
import type { UserAccessRequestSchema } from 'openapi';
import { NotificationStack } from './NotificationStack';

export const meta: StoryMeta = {
    title: 'Admin / AccessRequestsNotifications',
    background: 'application',
};

const baseTime = Date.parse('2026-06-24T12:00:00Z');

const makeRequests = (count: number): UserAccessRequestSchema[] => {
    const renderId = Date.now();
    return Array.from({ length: count }, (_, i) => ({
        id: `req-${renderId}-${i + 1}`,
        email: `requester${i + 1}@example.com`,
        requestedAt: new Date(baseTime - i * 86_400_000).toISOString(),
    }));
};

export const SingleRequest: Story = () => (
    <NotificationStack
        accessRequests={makeRequests(1)}
        storageKey='story:access-requests:single'
    />
);

export const FourRequests: Story = () => (
    <NotificationStack
        accessRequests={makeRequests(4)}
        storageKey='story:access-requests:four'
    />
);

export const TenRequestsOnlyLatestFourShown: Story = () => (
    <NotificationStack
        accessRequests={makeRequests(10)}
        maxVisible={4}
        storageKey='story:access-requests:ten'
    />
);

export const LongEmailTruncates: Story = () => (
    <NotificationStack
        accessRequests={[
            {
                id: 'req-long',
                email: 'a-very-long-email-address-that-should-truncate@some-organization.example.com',
                requestedAt: new Date(baseTime).toISOString(),
            },
        ]}
        storageKey='story:access-requests:long-email'
    />
);
