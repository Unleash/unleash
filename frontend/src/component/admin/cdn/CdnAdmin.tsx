import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Box } from '@mui/material';
import { ADMIN } from '@server/types/permissions';
import { CdnHelpAlert } from './CdnHelpAlert.tsx';
import { CdnForm } from './CdnForm.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

export const CdnAdmin = () => (
    <div>
        <PermissionGuard permissions={[ADMIN]}>
            <CdnPage />
        </PermissionGuard>
    </div>
);

const CdnPage = () => {
    const { loading } = useUiConfig();

    if (loading) {
        return null;
    }

    return (
        <PageContent header={<PageHeader title='CDN Tokens' />}>
            <Box sx={{ display: 'grid', gap: 4 }}>
                <CdnHelpAlert />
                <CdnForm availableTokens={[]} />
            </Box>
        </PageContent>
    );
};
