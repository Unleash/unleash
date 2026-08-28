import type { FC } from 'react';
import { useEventTracker } from 'hooks/useEventTracker';
import { InviteLinkBarContent } from './InviteLinkBarContent.tsx';
import { styled } from '@mui/material';

const Bar = styled('article')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    gap: theme.spacing(2),
    justifyContent: 'space-between',
    alignItems: 'center',
}));

export const InviteLinkBar: FC = () => {
    const { trackEvent } = useEventTracker();
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
