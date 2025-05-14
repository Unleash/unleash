import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import { READ_ROLE } from '@server/types/permissions';
import { RolesPage } from './RolesPage.tsx';

export const Roles = () => {
    const { isEnterprise } = useUiConfig();

    if (!isEnterprise()) {
        return <PremiumFeature feature='project-roles' page />;
    }

    return (
        <div>
            <PermissionGuard permissions={[READ_ROLE, ADMIN]}>
                <RolesPage />
            </PermissionGuard>
        </div>
    );
};
