import { KeyboardEvent, useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    IconButton,
    styled,
    ClickAwayListener,
    Button,
    Switch,
} from '@mui/material';
import { useNotifications } from 'hooks/api/getters/useNotifications/useNotifications';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { NotificationsHeader } from './NotificationsHeader';
import { NotificationsList } from './NotificationsList';
import { Notification } from './Notification';
import { EmptyNotifications } from './EmptyNotifications';
import { NotificationsSchemaItem } from 'openapi';
import { useNavigate } from 'react-router-dom';
import { useNotificationsApi } from 'hooks/api/actions/useNotificationsApi/useNotificationsApi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { flexRow } from 'themes/themeStyles';
import { Feedback } from 'component/common/Feedback/Feedback';

const StyledPrimaryContainerBox = styled(Box)(() => ({
    position: 'relative',
}));

const StyledInnerContainerBox = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
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
    width: '420px',
    boxShadow: theme.boxShadows.popup,
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    position: 'absolute',
    right: -100,
    top: 60,
    maxHeight: '80vh',
    overflowY: 'auto',
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

const StyledHeaderBox = styled(Box)(() => ({
    ...flexRow,
}));

const StyledHeaderTypography = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    '&:focus-visible': {
        outlineStyle: 'solid',
        outlineWidth: 2,
        outlineColor: theme.palette.primary.main,
        borderRadius: '100%',
    },
}));

export const Notifications = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const { notifications, refetchNotifications } = useNotifications({
        refreshInterval: 15000,
    });
    const navigate = useNavigate();
    const { markAsRead } = useNotificationsApi();
    const { uiConfig } = useUiConfig();
    const { trackEvent } = usePlausibleTracker();
    const [showUnread, setShowUnread] = useState(false);

    const onNotificationClick = async (
        notification: NotificationsSchemaItem
    ) => {
        if (notification.link) {
            navigate(notification.link);
        }

        if (uiConfig?.flags?.T) {
            trackEvent('notifications', {
                props: { eventType: notification.notificationType },
            });
        }

        setShowNotifications(false);

        try {
            await markAsRead({
                notifications: [notification.id],
            });
            refetchNotifications();
        } catch (e) {
            // No need to display this in the UI. Minor inconvinence if this call fails.
            console.error('Error marking notification as read: ', e);
        }
    };

    const onMarkAllAsRead = async () => {
        try {
            if (notifications && notifications.length > 0) {
                await markAsRead({
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

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            setShowNotifications(false);
        }
    };

    const unreadNotifications = notifications?.filter(
        notification => notification.readAt === null
    );

    const hasUnreadNotifications = Boolean(
        unreadNotifications && unreadNotifications.length > 0
    );

    const filterUnread = (notification: NotificationsSchemaItem) => {
        if (showUnread) {
            return !Boolean(notification.readAt);
        }

        return true;
    };

    const notificationComponents = notifications
        ?.filter(filterUnread)
        .map(notification => (
            <Notification
                notification={notification}
                key={notification.id}
                onNotificationClick={onNotificationClick}
            />
        ));

    const shouldShowFeedback = Boolean(
        notifications && notifications.length > 0 && !showUnread
    );

    return (
        <StyledPrimaryContainerBox>
            <StyledIconButton
                onClick={() => setShowNotifications(!showNotifications)}
                data-testid="NOTIFICATIONS_BUTTON"
                disableFocusRipple
            >
                <ConditionallyRender
                    condition={hasUnreadNotifications}
                    show={<StyledDotBox />}
                />
                <NotificationsIcon />
            </StyledIconButton>

            <ConditionallyRender
                condition={showNotifications}
                show={
                    <ClickAwayListener
                        onClickAway={() => setShowNotifications(false)}
                    >
                        <StyledPaper
                            className="dropdown-outline"
                            onKeyDown={onKeyDown}
                            data-testid="NOTIFICATIONS_MODAL"
                        >
                            <NotificationsHeader>
                                <StyledHeaderBox>
                                    <StyledHeaderTypography>
                                        Show only unread
                                    </StyledHeaderTypography>
                                    <Switch
                                        onClick={() =>
                                            setShowUnread(!showUnread)
                                        }
                                        checked={showUnread}
                                    />
                                </StyledHeaderBox>
                            </NotificationsHeader>
                            <ConditionallyRender
                                condition={hasUnreadNotifications}
                                show={
                                    <StyledInnerContainerBox data-testid="UNREAD_NOTIFICATIONS">
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
                                condition={notificationComponents?.length === 0}
                                show={
                                    <EmptyNotifications
                                        text={
                                            showUnread
                                                ? 'No unread notifications'
                                                : 'No new notifications'
                                        }
                                    />
                                }
                            />
                            <NotificationsList>
                                {notificationComponents}
                            </NotificationsList>
                            <ConditionallyRender
                                condition={shouldShowFeedback}
                                show={
                                    <>
                                        <Feedback
                                            eventName="notifications"
                                            id="useful"
                                            localStorageKey="NotificationsUsefulPrompt"
                                        />
                                        <br />
                                    </>
                                }
                            />
                        </StyledPaper>
                    </ClickAwayListener>
                }
            />
        </StyledPrimaryContainerBox>
    );
};
