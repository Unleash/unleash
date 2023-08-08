import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { ServiceAccountsTable } from './ServiceAccountsTable/ServiceAccountsTable';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';

export const ServiceAccounts = () => {
    const { isEnterprise } = useUiConfig();

    if (isEnterprise()) {
        return <PremiumFeature feature="service-accounts" page />;
    }

    return (
        <div>
            <PermissionGuard permissions={ADMIN}>
                <ServiceAccountsTable />
            </PermissionGuard>
        </div>
    );
};
