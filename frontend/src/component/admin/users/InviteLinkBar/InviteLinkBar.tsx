import type { VFC } from 'react';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { InviteLinkBarContent } from './InviteLinkBarContent';

export const InviteLinkBar: VFC = () => {
    const { trackEvent } = usePlausibleTracker();
    const onInviteLinkActionClick = (inviteLink?: string) => {
        trackEvent('invite', {
            props: {
                eventType: inviteLink
                    ? 'link bar action: edit'
                    : 'link bar action: create',
            },
        });
    };

    return <InviteLinkBarContent onActionClick={onInviteLinkActionClick} />;
};
