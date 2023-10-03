import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Box } from '@mui/material';
import { CorsHelpAlert } from 'component/admin/cors/CorsHelpAlert';
import { CorsForm } from 'component/admin/cors/CorsForm';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

export const CorsAdmin = () => (
    <div>
        <PermissionGuard permissions={ADMIN}>
            <CorsPage />
        </PermissionGuard>
    </div>
);

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
