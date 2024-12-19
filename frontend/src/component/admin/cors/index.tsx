import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Box } from '@mui/material';
import { CorsHelpAlert } from 'component/admin/cors/CorsHelpAlert';
import { CorsForm } from 'component/admin/cors/CorsForm';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ADMIN, UPDATE_CORS } from '@server/types/permissions';

export const CorsAdmin = () => (
    <div>
        <PermissionGuard permissions={[ADMIN, UPDATE_CORS]}>
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
        <PageContent header={<PageHeader title='CORS origins' />}>
            <Box sx={{ display: 'grid', gap: 4 }}>
                <CorsHelpAlert />
                <CorsForm frontendApiOrigins={uiConfig.frontendApiOrigins} />
            </Box>
        </PageContent>
    );
};
