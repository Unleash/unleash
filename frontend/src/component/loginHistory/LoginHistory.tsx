import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { LoginHistoryTable } from './LoginHistoryTable/LoginHistoryTable';

export const LoginHistory = () => (
    <div>
        <PermissionGuard permissions={ADMIN}>
            <LoginHistoryTable />
        </PermissionGuard>
    </div>
);
