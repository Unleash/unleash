import type { VFC } from 'react';
import { Box } from '@mui/material';
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

    return (
        <Box
            sx={(theme) => ({
                backgroundColor: theme.palette.background.paper,
                py: 2,
                px: 4,
                mb: 2,
                borderRadius: `${theme.shape.borderRadiusLarge}px`,
                display: 'flex',
                flexDirection: {
                    xs: 'column',
                    md: 'row',
                },
                border: '2px solid',
                borderColor: theme.palette.background.alternative,
            })}
        >
            <InviteLinkBarContent onActionClick={onInviteLinkActionClick} />
        </Box>
    );
};
