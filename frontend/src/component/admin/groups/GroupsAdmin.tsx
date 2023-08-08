import { Route, Routes } from 'react-router-dom';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { GroupsList } from './GroupsList/GroupsList';
import { ADMIN } from '@server/types/permissions';
import { CreateGroup } from './CreateGroup/CreateGroup';
import { EditGroupContainer } from './EditGroup/EditGroup';
import { Group } from './Group/Group';

export const GroupsAdmin = () => (
    <div>
        <PermissionGuard permissions={ADMIN}>
            <Routes>
                <Route index element={<GroupsList />} />
                <Route path="create-group" element={<CreateGroup />} />
                <Route path=":groupId/edit" element={<EditGroupContainer />} />
                <Route path=":groupId" element={<Group />} />
            </Routes>
        </PermissionGuard>
    </div>
);
