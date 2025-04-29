import { useNavigate } from 'react-router-dom';
import { Box, Button, styled, Typography } from '@mui/material';
import useLoading from 'hooks/useLoading';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useInviteTokens } from 'hooks/api/getters/useInviteTokens/useInviteTokens';
import { LinkField } from '../LinkField/LinkField.tsx';
import { add, formatDistanceToNowStrict, isAfter, parseISO } from 'date-fns';
import { formatDateYMD } from 'utils/formatDate';
import { useLocationSettings } from 'hooks/useLocationSettings';

interface IInviteLinkBarContentProps {
    onActionClick?: (inviteLink?: string) => void;
}

export const StyledBox = styled(Box)(() => ({
    mb: {
        xs: 1,
        md: 0,
    },
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
}));

export const InviteLinkBarContent = ({
    onActionClick,
}: IInviteLinkBarContentProps) => {
    const navigate = useNavigate();
    const { data, loading } = useInviteTokens();
    const ref = useLoading(loading);
    const inviteToken =
        data?.tokens?.find((token) => token.name === 'default') ?? null;
    const inviteLink = inviteToken?.url;
    const createdAt = data?.tokens?.[0]?.createdAt ?? '';
    const expiresAt = data?.tokens?.[0]?.expiresAt ?? '';
    const expires = expiresAt || false;
    const isExpired = Boolean(
        expires && isAfter(new Date(), parseISO(expires)),
    );
    const willExpireSoon =
        expires && isAfter(add(new Date(), { days: 14 }), parseISO(expires));
    const expiresIn = expires
        ? formatDistanceToNowStrict(parseISO(expires))
        : false;
    const { locationSettings } = useLocationSettings();

    const expireDateComponent = (
        <Typography
            component='span'
            variant='body2'
            color={willExpireSoon ? 'warning.dark' : 'inherit'}
            fontWeight='bold'
        >
            {expiresIn}
        </Typography>
    );

    const onInviteLinkActionClick = () => {
        onActionClick?.(inviteLink);
        navigate('/admin/invite-link');
    };
    return (
        <>
            <StyledBox ref={ref}>
                <ConditionallyRender
                    condition={Boolean(inviteLink)}
                    show={
                        <>
                            <Typography variant='body2' sx={{ mb: 1 }}>
                                {`You have an invite link created on ${formatDateYMD(
                                    createdAt,
                                    locationSettings.locale,
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
                            <LinkField
                                small
                                inviteLink={inviteLink!}
                                isExpired={isExpired}
                            />
                        </>
                    }
                    elseShow={
                        <Typography variant='body2' data-loading>
                            Create a link to invite people from your company to
                            your Unleash setup.
                        </Typography>
                    }
                />
            </StyledBox>
            <Button
                variant='outlined'
                onClick={onInviteLinkActionClick}
                data-loading
            >
                {inviteLink ? 'Update' : 'Create'} invite link
            </Button>
        </>
    );
};
