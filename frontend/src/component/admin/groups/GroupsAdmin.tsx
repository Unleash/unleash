import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { GroupsList } from './GroupsList/GroupsList';
import { ADMIN } from '@server/types/permissions';

export const GroupsAdmin = () => (
    <div>
        <PermissionGuard permissions={ADMIN}>
            <GroupsList />
        </PermissionGuard>
    </div>
);
