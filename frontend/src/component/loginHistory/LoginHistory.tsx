import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { LoginHistoryTable } from './LoginHistoryTable/LoginHistoryTable.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import { READ_LOGS } from '@server/types/permissions';

export const LoginHistory = () => {
    const { isEnterprise } = useUiConfig();

    if (!isEnterprise()) {
        return <PremiumFeature feature='login-history' page />;
    }

    return (
        <div>
            <PermissionGuard permissions={[ADMIN, READ_LOGS]}>
                <LoginHistoryTable />
            </PermissionGuard>
        </div>
    );
};
