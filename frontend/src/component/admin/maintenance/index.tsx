import { useLocation } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import AdminMenu from '../menu/AdminMenu';
import { AdminAlert } from 'component/common/AdminAlert/AdminAlert';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import AccessContext from 'contexts/AccessContext';
import React, { useContext } from 'react';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Box, CardContent, styled } from '@mui/material';
import { CorsHelpAlert } from 'component/admin/cors/CorsHelpAlert';
import { CorsForm } from 'component/admin/cors/CorsForm';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { MaintenanceTooltip } from './MaintenanceTooltip';
import { MaintenanceToggle } from './MaintenanceToggle';

export const MaintenanceAdmin = () => {
    const { pathname } = useLocation();
    const showAdminMenu = pathname.includes('/admin/');
    const { hasAccess } = useContext(AccessContext);

    return (
        <div>
            <ConditionallyRender
                condition={showAdminMenu}
                show={<AdminMenu />}
            />
            <ConditionallyRender
                condition={hasAccess(ADMIN)}
                show={<MaintenancePage />}
                elseShow={<AdminAlert />}
            />
        </div>
    );
};

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'grid',
    gap: theme.spacing(2),
}));
const MaintenancePage = () => {
    const { uiConfig, loading } = useUiConfig();

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
