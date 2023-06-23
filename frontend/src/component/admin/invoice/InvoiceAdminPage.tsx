import InvoiceList from './InvoiceList';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';

export const InvoiceAdminPage = () => (
    <div>
        <PermissionGuard permissions={ADMIN}>
            <InvoiceList />
        </PermissionGuard>
    </div>
);
