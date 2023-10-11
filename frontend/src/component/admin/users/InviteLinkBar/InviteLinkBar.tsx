import { VFC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import useLoading from 'hooks/useLoading';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useInviteTokens } from 'hooks/api/getters/useInviteTokens/useInviteTokens';
import { LinkField } from '../LinkField/LinkField';
import { add, formatDistanceToNowStrict, isAfter, parseISO } from 'date-fns';
import { formatDateYMD } from 'utils/formatDate';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { InviteLinkBarContent } from './InviteLinkBarContent';

export const InviteLinkBar: VFC = () => {
    return (
        <Box
            sx={(theme) => ({
                backgroundColor: theme.palette.background.paper,
                py: 2,
                px: 4,
                mb: 2,
                borderRadius: `${theme.shape.borderRadiusLarge}px`,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                border: '2px solid',
                borderColor: theme.palette.background.alternative,
            })}
        >
            <InviteLinkBarContent />
        </Box>
    );
};
