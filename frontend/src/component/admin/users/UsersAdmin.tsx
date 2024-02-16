import UsersList from './UsersList/UsersList';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { InviteLinkBar } from './InviteLinkBar/InviteLinkBar';
import { Route, Routes } from 'react-router-dom';
import EditUser from './EditUser/EditUser';
import NotFound from 'component/common/NotFound/NotFound';
import { InactiveUsersList } from './InactiveUsersList/InactiveUsersList';
import { AccessMatrix } from './AccessMatrix/AccessMatrix';

export const UsersAdmin = () => (
    <div>
        <PermissionGuard permissions={ADMIN}>
            <Routes>
                <Route
                    index
                    element={
                        <>
                            <InviteLinkBar />
                            <UsersList />
                        </>
                    }
                />
                <Route path=':id/edit' element={<EditUser />} />
                <Route path=':id/access' element={<AccessMatrix />} />
                <Route path='inactive' element={<InactiveUsersList />} />
                <Route path='*' element={<NotFound />} />
            </Routes>
        </PermissionGuard>
    </div>
);

export default UsersAdmin;
