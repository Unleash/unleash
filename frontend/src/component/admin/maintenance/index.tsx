import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Box, styled } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { MaintenanceTooltip } from './MaintenanceTooltip.tsx';
import { MaintenanceToggle } from './MaintenanceToggle.tsx';
import { UPDATE_MAINTENANCE_MODE } from '@server/types/permissions';

export const MaintenanceAdmin = () => (
    <div>
        <PermissionGuard permissions={[ADMIN, UPDATE_MAINTENANCE_MODE]}>
            <MaintenancePage />
        </PermissionGuard>
    </div>
);

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'grid',
    gap: theme.spacing(4),
}));

const MaintenancePage = () => {
    const { loading } = useUiConfig();

    if (loading) {
        return null;
    }

    return (
        <PageContent header={<PageHeader title='Maintenance' />}>
            <StyledBox>
                <MaintenanceTooltip />
                <MaintenanceToggle />
            </StyledBox>
        </PageContent>
    );
};
