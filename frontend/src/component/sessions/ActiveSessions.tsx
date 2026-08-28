import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import { ActiveSessionsTable } from './ActiveSessionsTable/ActiveSessionsTable.tsx';

export const ActiveSessions = () => {
    const { isEnterprise } = useUiConfig();

    if (!isEnterprise()) {
        return <PremiumFeature feature='active-sessions' page />;
    }

    return (
        <div>
            <PermissionGuard permissions={[ADMIN]}>
                <ActiveSessionsTable />
            </PermissionGuard>
        </div>
    );
};
