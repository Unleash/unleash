import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { ServiceAccountsTable } from './ServiceAccountsTable/ServiceAccountsTable.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

export const ServiceAccounts = () => {
    const { isEnterprise } = useUiConfig();

    return (
        <div>
            <ConditionallyRender
                condition={isEnterprise()}
                show={
                    <PermissionGuard permissions={ADMIN}>
                        <ServiceAccountsTable />
                    </PermissionGuard>
                }
                elseShow={<PremiumFeature feature='service-accounts' page />}
            />
        </div>
    );
};
