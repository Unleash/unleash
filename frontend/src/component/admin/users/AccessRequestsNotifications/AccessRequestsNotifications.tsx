import { useLocation } from 'react-router';
import { styled } from '@mui/material';
import { useUserAccessRequests } from 'hooks/api/getters/useUserAccessRequests/useUserAccessRequests';
import { useHasRootAccess } from 'hooks/useHasAccess';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { NotificationStack } from './NotificationStack/NotificationStack';

const HIDDEN_PATH_SEGMENTS = ['/admin/users'];

export const isHiddenRoute = (pathname: string): boolean =>
    HIDDEN_PATH_SEGMENTS.some((segment) =>
        new RegExp(`(^|/)${segment.slice(1)}(/|$)`).test(pathname),
    );

const StyledOverlay = styled('div')(({ theme }) => ({
    position: 'fixed',
    top: theme.spacing(8),
    right: theme.spacing(2),
    zIndex: theme.zIndex.appBar - 1,
    maxWidth: `calc(100vw - ${theme.spacing(6)})`,
}));

const AdminAccessRequestsNotifications = () => {
    const { accessRequests } = useUserAccessRequests();

    if (accessRequests.length === 0) {
        return null;
    }

    return (
        <StyledOverlay>
            <NotificationStack accessRequests={accessRequests} />
        </StyledOverlay>
    );
};

export const AccessRequestsNotifications = () => {
    const { pathname } = useLocation();
    const hasAdminAccess = useHasRootAccess(ADMIN);

    if (!hasAdminAccess || isHiddenRoute(pathname)) {
        return null;
    }

    return <AdminAccessRequestsNotifications />;
};
