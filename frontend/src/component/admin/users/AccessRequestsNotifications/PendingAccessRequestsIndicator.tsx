import { styled, Tooltip } from '@mui/material';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { useUserAccessRequests } from 'hooks/api/getters/useUserAccessRequests/useUserAccessRequests';
import { useHasRootAccess } from 'hooks/useHasAccess';
import { useUiFlag } from 'hooks/useUiFlag';

const Dot = styled('span')(({ theme }) => ({
    width: theme.spacing(0.875),
    height: theme.spacing(0.875),
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    display: 'inline-block',
    flexShrink: 0,
}));

const AdminPendingAccessRequestsIndicator = () => {
    const { accessRequests } = useUserAccessRequests();

    if (accessRequests.length === 0) {
        return null;
    }

    return (
        <Tooltip title='Pending access requests' arrow>
            <Dot aria-label='Pending access requests' />
        </Tooltip>
    );
};

export const PendingAccessRequestsIndicator = () => {
    const enabled = useUiFlag('accessRequestsMenuIndicator');
    const hasAdminAccess = useHasRootAccess(ADMIN);

    if (!enabled || !hasAdminAccess) {
        return null;
    }

    return <AdminPendingAccessRequestsIndicator />;
};
