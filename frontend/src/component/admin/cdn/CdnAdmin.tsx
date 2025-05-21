import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { ADMIN } from '@server/types/permissions';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { CdnTokenPage } from './CdnTokenPage/CdnTokenPage.tsx';

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

    return <CdnTokenPage />;
};
