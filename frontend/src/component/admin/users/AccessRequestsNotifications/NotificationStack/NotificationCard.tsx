import { Link as RouterLink } from 'react-router';
import {
    Box,
    Button,
    IconButton,
    Paper,
    Typography,
    styled,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import type { UserAccessRequestSchema } from 'openapi';
import { useEventTracker } from 'hooks/useEventTracker';

interface INotificationCardProps {
    request: UserAccessRequestSchema;
    onDismiss: (id: string) => void;
}

const StyledCard = styled(Paper)(({ theme }) => ({
    display: 'inline-flex',
    padding: theme.spacing(1),
    alignItems: 'center',
    gap: theme.spacing(1.5),
}));

const StyledUserInfo = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flex: 1,
    minWidth: 0,
}));

const StyledBody = styled(Box)(() => ({
    flex: 1,
    minWidth: 0,
}));

const StyledEmail = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: 'normal',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
}));

const StyledCaption = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    lineHeight: 'normal',
}));

const StyledActions = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const StyledDismissButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.neutral.main,
}));

export const NotificationCard = ({
    request,
    onDismiss,
}: INotificationCardProps) => {
    const { trackEvent } = useEventTracker();

    const onViewClick = () => {
        trackEvent('access-requests-notification', {
            props: {
                eventType: 'view-click',
            },
        });
    };

    const onDismissClick = () => {
        trackEvent('access-requests-notification', {
            props: {
                eventType: 'dismiss-click',
            },
        });
        onDismiss(request.id);
    };

    return (
        <StyledCard elevation={3}>
            <StyledUserInfo>
                <UserAvatar
                    user={{
                        email: request.email,
                        imageUrl: request.imageUrl,
                    }}
                />
                <StyledBody>
                    <StyledEmail title={request.email}>
                        {request.email}
                    </StyledEmail>
                    <StyledCaption>requested access</StyledCaption>
                </StyledBody>
            </StyledUserInfo>
            <StyledActions>
                <Button
                    size='small'
                    variant='contained'
                    color='primary'
                    component={RouterLink}
                    to='/admin/users'
                    onClick={onViewClick}
                >
                    View request
                </Button>
                <StyledDismissButton
                    size='small'
                    aria-label={`Dismiss notification for ${request.email}`}
                    onClick={onDismissClick}
                >
                    <CloseIcon fontSize='small' />
                </StyledDismissButton>
            </StyledActions>
        </StyledCard>
    );
};
