import { useLocation } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import AdminMenu from '../menu/AdminMenu';
import { AdminAlert } from 'component/common/AdminAlert/AdminAlert';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import AccessContext from 'contexts/AccessContext';
import React, { useContext } from 'react';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Box } from '@mui/material';
import { CorsHelpAlert } from 'component/admin/cors/CorsHelpAlert';
import { CorsForm } from 'component/admin/cors/CorsForm';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

export const CorsAdmin = () => {
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
                show={<CorsPage />}
                elseShow={<AdminAlert />}
            />
        </div>
    );
};

const CorsPage = () => {
    const { uiConfig, loading } = useUiConfig();

    if (loading) {
        return null;
    }

    return (
        <PageContent header={<PageHeader title="CORS origins" />}>
            <Box sx={{ display: 'grid', gap: 4 }}>
                <CorsHelpAlert />
                <CorsForm frontendApiOrigins={uiConfig.frontendApiOrigins} />
            </Box>
        </PageContent>
    );
};
