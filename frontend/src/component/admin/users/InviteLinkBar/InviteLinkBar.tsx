import type { VFC } from 'react';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { InviteLinkBarContent } from './InviteLinkBarContent.tsx';
import { styled } from '@mui/material';

const Bar = styled('article')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    gap: theme.spacing(2),
    justifyContent: 'space-between',
    alignItems: 'center',
}));

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

    return (
        <Bar>
            <InviteLinkBarContent onActionClick={onInviteLinkActionClick} />
        </Bar>
    );
};
