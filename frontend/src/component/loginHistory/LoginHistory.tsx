import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { LoginHistoryTable } from './LoginHistoryTable/LoginHistoryTable';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';

export const LoginHistory = () => {
    const { isEnterprise } = useUiConfig();

    if (!isEnterprise()) {
        return <PremiumFeature feature='login-history' page />;
    }

    return (
        <div>
            <PermissionGuard permissions={ADMIN}>
                <LoginHistoryTable />
            </PermissionGuard>
        </div>
    );
};
