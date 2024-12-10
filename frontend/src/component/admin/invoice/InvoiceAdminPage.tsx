import InvoiceList from './InvoiceList';
import { ADMIN } from '@server/types/permissions';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';

export const InvoiceAdminPage = () => (
    <div>
        <PermissionGuard permissions={ADMIN}>
            <InvoiceList />
        </PermissionGuard>
    </div>
);
