import { useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    IconButton,
    styled,
    ClickAwayListener,
    Button,
} from '@mui/material';
import { useNotifications } from 'hooks/api/getters/useNotifications/useNotifications';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { NotificationsHeader } from './NotificationsHeader';
import { NotificationsList } from './NotificationsList';
import { Notification } from './Notification';
import { EmptyNotifications } from './EmptyNotifications';
import { NotificationsSchemaItem } from 'openapi';
import { useNavigate } from 'react-router-dom';
import { useNotificationsApi } from 'hooks/api/actions/useNotificationsApi/useNotificationsApi';

const StyledPrimaryContainerBox = styled(Box)(() => ({
    position: 'relative',
}));

const StyledInnerContainerBox = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.neutral.light,
    padding: theme.spacing(1, 3),
    display: 'flex',
    justifyContent: 'center',
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.primary.main,
    textAlign: 'center',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    minWidth: '400px',
    boxShadow: theme.boxShadows.popup,
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    position: 'absolute',
    right: -20,
    top: 60,
}));

const StyledDotBox = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    borderRadius: '100%',
    width: '7px',
    height: '7px',
    position: 'absolute',
    top: 7,
    right: 4,
}));

export const Notifications = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const { notifications, refetchNotifications } = useNotifications({
        refreshInterval: 15,
    });
    const navigate = useNavigate();
    const { markAsRead } = useNotificationsApi();

    const onNotificationClick = (notification: NotificationsSchemaItem) => {
        navigate(notification.link);
        setShowNotifications(false);

        // Intentionally not wait for this request. We don't want to hold the user back
        // only to mark a notification as read.
        try {
            markAsRead({
                notifications: [notification.id],
            });
        } catch (e) {
            // No need to display this in the UI. Minor inconvinence if this call fails.
            console.error('Error marking notification as read: ', e);
        }
    };

    const onMarkAllAsRead = () => {
        try {
            if (notifications && notifications.length > 0) {
                markAsRead({
                    notifications: notifications.map(
                        notification => notification.id
                    ),
                });
                refetchNotifications();
            }
        } catch (e) {
            // No need to display this in the UI. Minor inconvinence if this call fails.
            console.error('Error marking all notification as read: ', e);
        }
    };

    const unreadNotifications = notifications?.filter(
        notification => notification.readAt === null
    );

    const hasUnreadNotifications = Boolean(
        unreadNotifications && unreadNotifications.length > 0
    );

    return (
        <StyledPrimaryContainerBox>
            <IconButton
                onClick={() => setShowNotifications(!showNotifications)}
            >
                <ConditionallyRender
                    condition={hasUnreadNotifications}
                    show={<StyledDotBox />}
                />
                <NotificationsIcon />
            </IconButton>

            <ConditionallyRender
                condition={showNotifications}
                show={
                    <ClickAwayListener
                        onClickAway={() => setShowNotifications(false)}
                    >
                        <StyledPaper>
                            <NotificationsHeader />
                            <ConditionallyRender
                                condition={hasUnreadNotifications}
                                show={
                                    <StyledInnerContainerBox>
                                        <Button onClick={onMarkAllAsRead}>
                                            <StyledTypography>
                                                Mark all as read (
                                                {unreadNotifications?.length})
                                            </StyledTypography>
                                        </Button>
                                    </StyledInnerContainerBox>
                                }
                            />{' '}
                            <ConditionallyRender
                                condition={notifications?.length === 0}
                                show={<EmptyNotifications />}
                            />
                            <NotificationsList>
                                {notifications?.map(notification => (
                                    <Notification
                                        notification={notification}
                                        key={notification.id}
                                        onNotificationClick={
                                            onNotificationClick
                                        }
                                    />
                                ))}
                            </NotificationsList>
                        </StyledPaper>
                    </ClickAwayListener>
                }
            />
        </StyledPrimaryContainerBox>
    );
};
