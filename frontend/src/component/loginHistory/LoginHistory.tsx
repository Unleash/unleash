import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { LoginHistoryTable } from './LoginHistoryTable/LoginHistoryTable';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { EnterpriseFeatureUpgradePage } from 'component/common/EnterpriseFeatureUpgradePage/EnterpriseFeatureUpgradePage';

export const LoginHistory = () => {
    const { isEnterprise } = useUiConfig();

    if (!isEnterprise()) {
        return (
            <EnterpriseFeatureUpgradePage
                title="Login history"
                link="https://docs.getunleash.io/reference/login-history"
            />
        );
    }

    return (
        <div>
            <PermissionGuard permissions={ADMIN}>
                <LoginHistoryTable />
            </PermissionGuard>
        </div>
    );
};
