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
    alignSelf: 'flex-start',
    verticalAlign: 'top',
    '.Mui-selected &': {
        backgroundColor: theme.palette.common.white,
    },
}));

type PendingAccessRequestsIndicatorProps = {
    showTooltip?: boolean;
};

const AdminPendingAccessRequestsIndicator = ({
    showTooltip = true,
}: PendingAccessRequestsIndicatorProps) => {
    const { accessRequests } = useUserAccessRequests();

    if (accessRequests.length === 0) {
        return null;
    }

    const dot = <Dot aria-label='Pending access requests' />;

    if (!showTooltip) {
        return dot;
    }

    return (
        <Tooltip title='Pending access requests' arrow>
            {dot}
        </Tooltip>
    );
};

export const PendingAccessRequestsIndicator = (
    props: PendingAccessRequestsIndicatorProps,
) => {
    const enabled = useUiFlag('accessRequestsMenuIndicator');
    const hasAdminAccess = useHasRootAccess(ADMIN);

    if (!enabled || !hasAdminAccess) {
        return null;
    }

    return <AdminPendingAccessRequestsIndicator {...props} />;
};
