import { ListItemButton, useTheme } from '@mui/material';
import { Box, ListItem, Typography, styled, Button } from '@mui/material';
import {
    NotificationsSchemaItem,
    NotificationsSchemaItemNotificationType,
} from 'openapi';
import { ReactComponent as ChangesAppliedIcon } from 'assets/icons/merge.svg';
import TimeAgo from 'react-timeago';
import { ToggleOffOutlined } from '@mui/icons-material';

const StyledContainerBox = styled(Box, {
    shouldForwardProp: prop => prop !== 'readAt',
})<{ readAt: boolean }>(({ theme, readAt }) => ({
    padding: theme.spacing(0.5),
    backgroundColor: readAt
        ? theme.palette.neutral.light
        : theme.palette.secondary.light,
    width: '30px',
    height: '30px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: `${theme.shape.borderRadius}px`,
    position: 'absolute',
    top: 3,
    left: 7,
}));

const StyledListItem = styled(ListItemButton)(({ theme }) => ({
    position: 'relative',
    cursor: 'pointer',
    margin: theme.spacing(2, 0),
    '&:not(:last-child)': {
        borderBottom: `2px solid ${theme.palette.tertiary.contrast}`,
    },
    width: '100%',
}));

const StyledNotificationMessageBox = styled(Box)(({ theme }) => ({
    marginLeft: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
}));

const StyledSecondaryInfoBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    margin: theme.spacing(1, 0, 1, 0),
}));

const StyledMessageTypography = styled(Typography, {
    shouldForwardProp: prop => prop !== 'readAt',
})<{ readAt: boolean }>(({ theme, readAt }) => ({
    fontSize: theme.fontSizes.smallBody,
    fontWeight: readAt ? 'normal' : 'bold',
    textDecoration: 'none',
    color: 'inherit',
}));

const StyledTimeAgoTypography = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.neutral.main,
}));

interface INotificationProps {
    notification: NotificationsSchemaItem;
    onNotificationClick: (notification: NotificationsSchemaItem) => void;
}

export const Notification = ({
    notification,
    onNotificationClick,
}: INotificationProps) => {
    const theme = useTheme();
    const { readAt } = notification;

    const resolveIcon = (type: NotificationsSchemaItemNotificationType) => {
        if (type === 'change-request') {
            return (
                <StyledContainerBox readAt={Boolean(readAt)}>
                    <ChangesAppliedIcon
                        color={
                            notification.readAt
                                ? theme.palette.neutral.main
                                : theme.palette.primary.main
                        }
                        style={{ transform: 'scale(0.8)' }}
                    />
                </StyledContainerBox>
            );
        }

        if (type === 'toggle') {
            return (
                <StyledContainerBox readAt={Boolean(readAt)}>
                    <ToggleOffOutlined
                        sx={theme => ({
                            height: '20px',
                            width: '20px',
                            color: Boolean(readAt)
                                ? theme.palette.neutral.main
                                : theme.palette.primary.main,
                        })}
                    />
                </StyledContainerBox>
            );
        }
    };

    return (
        <StyledListItem
            onClick={() => onNotificationClick(notification)}
            aria-role="button"
        >
            {resolveIcon(notification.notificationType)}{' '}
            <StyledNotificationMessageBox>
                <StyledMessageTypography readAt={Boolean(readAt)}>
                    {notification.message}
                </StyledMessageTypography>
                <StyledSecondaryInfoBox>
                    <StyledTimeAgoTypography>
                        <TimeAgo date={new Date(notification.createdAt)} />
                    </StyledTimeAgoTypography>
                </StyledSecondaryInfoBox>
            </StyledNotificationMessageBox>
        </StyledListItem>
    );
};
