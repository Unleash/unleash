import UsersList from './UsersList/UsersList';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { InviteLinkBar } from './InviteLinkBar/InviteLinkBar';

export const UsersAdmin = () => (
    <div>
        <InviteLinkBar />
        <PermissionGuard permissions={ADMIN}>
            <UsersList />
        </PermissionGuard>
    </div>
);

export default UsersAdmin;
