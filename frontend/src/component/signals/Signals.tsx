import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import { SignalEndpointsTable } from './SignalEndpointsTable/SignalEndpointsTable';

export const Signals = () => {
    const { isEnterprise } = useUiConfig();

    if (!isEnterprise()) {
        return <PremiumFeature feature='signals' />;
    }

    return (
        <div>
            <PermissionGuard permissions={ADMIN}>
                <SignalEndpointsTable />
            </PermissionGuard>
        </div>
    );
};
