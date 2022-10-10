import { useEffect, VFC } from 'react';
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

export const InviteLinkBar: VFC = () => {
    const navigate = useNavigate();
    const { data, loading } = useInviteTokens();
    const ref = useLoading(loading);
    const { trackEvent } = usePlausibleTracker();
    const inviteToken =
        data?.tokens?.find(token => token.name === 'default') ?? null;
    const inviteLink = inviteToken?.url;
    const createdAt = data?.tokens?.[0]?.createdAt ?? '';
    const expiresAt = data?.tokens?.[0]?.expiresAt ?? '';
    const expires = expiresAt || false;
    const isExpired = Boolean(
        expires && isAfter(new Date(), parseISO(expires))
    );
    const willExpireSoon =
        expires && isAfter(add(new Date(), { days: 14 }), parseISO(expires));
    const expiresIn = expires
        ? formatDistanceToNowStrict(parseISO(expires))
        : false;
    const { locationSettings } = useLocationSettings();

    const expireDateComponent = (
        <Typography
            component="span"
            variant="body2"
            color={willExpireSoon ? 'warning.main' : 'inherit'}
            fontWeight="bold"
        >
            {expiresIn}
        </Typography>
    );

    const onInviteLinkActionClick = () => {
        trackEvent('invite', {
            props: {
                eventType: Boolean(inviteLink)
                    ? 'link bar action: edit'
                    : 'link bar action: create',
            },
        });

        navigate('/admin/invite-link');
    };

    return (
        <Box
            sx={{
                backgroundColor: 'tertiary.background',
                py: 2,
                px: 4,
                mb: 2,
                borderRadius: theme => `${theme.shape.borderRadiusLarge}px`,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                border: '2px solid',
                borderColor: 'primary.main',
            }}
            ref={ref}
        >
            <Box
                sx={{
                    mb: { xs: 1, md: 0 },
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                }}
            >
                <ConditionallyRender
                    condition={Boolean(inviteLink)}
                    show={
                        <>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                {`You have an invite link created on ${formatDateYMD(
                                    createdAt,
                                    locationSettings.locale
                                )} `}
                                <ConditionallyRender
                                    condition={isExpired}
                                    show={
                                        <>
                                            that expired {expireDateComponent}{' '}
                                            ago
                                        </>
                                    }
                                    elseShow={
                                        <>
                                            that will expire in{' '}
                                            {expireDateComponent}
                                        </>
                                    }
                                />
                            </Typography>
                            <LinkField small inviteLink={inviteLink!} />
                        </>
                    }
                    elseShow={
                        <Typography variant="body2" data-loading>
                            You can easily create an invite link here that you
                            can share and use to invite people from your company
                            to your Unleash setup.
                        </Typography>
                    }
                />
            </Box>
            <Box
                sx={{
                    minWidth: 200,
                    display: 'flex',
                    justifyContent: { xs: 'center', md: 'flex-end' },
                    alignItems: 'center',
                    flexGrow: 1,
                }}
            >
                <Button
                    variant="outlined"
                    onClick={onInviteLinkActionClick}
                    data-loading
                >
                    {inviteLink ? 'Update' : 'Create'} invite link
                </Button>
            </Box>
        </Box>
    );
};
