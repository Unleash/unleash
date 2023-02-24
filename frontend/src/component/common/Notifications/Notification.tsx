import { useTheme } from '@mui/material';
import { Box, ListItem, Typography, styled } from '@mui/material';
import {
    NotificationsSchemaItem,
    NotificationsSchemaItemNotificationType,
} from 'openapi';
import { ReactComponent as ChangesAppliedIcon } from 'assets/icons/merge.svg';
import TimeAgo from 'react-timeago';

const StyledContainerbox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(0.5),
    backgroundColor: theme.palette.secondary.light,
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

const StyledListItem = styled(ListItem)(({ theme }) => ({
    position: 'relative',
    cursor: 'pointer',
    margin: theme.spacing(2, 0),
    '&:not(:last-child)': {
        borderBottom: `2px solid ${theme.palette.tertiary.contrast}`,
    },
}));

const StyledNotificationMessageBox = styled(Box)(({ theme }) => ({
    marginLeft: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
}));

const StyledSecondaryInfoBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    margin: theme.spacing(1, 0, 1, 0),
}));

const StyledMessageTypography = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    fontWeight: 'bold',
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

    const resolveIcon = (type: NotificationsSchemaItemNotificationType) => {
        if (type === 'change-request' && notification.readAt === undefined) {
            return (
                <StyledContainerbox>
                    <ChangesAppliedIcon
                        color={theme.palette.primary.main}
                        style={{ transform: 'scale(0.8)' }}
                    />
                </StyledContainerbox>
            );
        }
    };

    return (
        <StyledListItem onClick={() => onNotificationClick(notification)}>
            {resolveIcon(notification.notificationType)}{' '}
            <StyledNotificationMessageBox>
                <StyledMessageTypography>
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
