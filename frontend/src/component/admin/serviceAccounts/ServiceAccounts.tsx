import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { ServiceAccountsTable } from './ServiceAccountsTable/ServiceAccountsTable';

export const ServiceAccounts = () => (
    <div>
        <PermissionGuard permissions={ADMIN}>
            <ServiceAccountsTable />
        </PermissionGuard>
    </div>
);
