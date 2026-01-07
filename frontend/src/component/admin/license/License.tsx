import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { LicenseForm } from './LicenseForm';

export const License = () => (
    <div>
        <PermissionGuard permissions={[ADMIN]}>
            <LicenseForm />
        </PermissionGuard>
    </div>
);
