import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Box, styled } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { MaintenanceTooltip } from './MaintenanceTooltip';
import { MaintenanceToggle } from './MaintenanceToggle';

export const MaintenanceAdmin = () => (
    <div>
        <PermissionGuard permissions={ADMIN}>
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
        <PageContent header={<PageHeader title="Maintenance" />}>
            <StyledBox>
                <MaintenanceTooltip />
                <MaintenanceToggle />
            </StyledBox>
        </PageContent>
    );
};
