import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import { BannersTable } from './BannersTable/BannersTable.tsx';
import { UPDATE_INSTANCE_BANNERS } from '@server/types/permissions';

export const Banners = () => {
    const { isEnterprise } = useUiConfig();

    if (!isEnterprise()) {
        return <PremiumFeature feature='banners' page />;
    }

    return (
        <div>
            <PermissionGuard permissions={[ADMIN, UPDATE_INSTANCE_BANNERS]}>
                <BannersTable />
            </PermissionGuard>
        </div>
    );
};
