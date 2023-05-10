import { Routes, Route } from 'react-router-dom';
import { ApiTokenPage } from './apiToken/ApiTokenPage/ApiTokenPage';
import { CreateApiToken } from './apiToken/CreateApiToken/CreateApiToken';
import { AuthSettings } from './auth/AuthSettings';
import { Billing } from './billing/Billing';
import FlaggedBillingRedirect from './billing/FlaggedBillingRedirect/FlaggedBillingRedirect';
import { CorsAdmin } from './cors';
import { CreateGroup } from './groups/CreateGroup/CreateGroup';
import { EditGroupContainer } from './groups/EditGroup/EditGroup';
import { Group } from './groups/Group/Group';
import { GroupsAdmin } from './groups/GroupsAdmin';
import { InstanceAdmin } from './instance-admin/InstanceAdmin';
import { MaintenanceAdmin } from './maintenance';
import AdminMenu from './menu/AdminMenu';
import { Network } from './network/Network';
import CreateProjectRole from './projectRoles/CreateProjectRole/CreateProjectRole';
import EditProjectRole from './projectRoles/EditProjectRole/EditProjectRole';
import ProjectRoles from './projectRoles/ProjectRoles/ProjectRoles';
import { ServiceAccounts } from './serviceAccounts/ServiceAccounts';
import CreateUser from './users/CreateUser/CreateUser';
import EditUser from './users/EditUser/EditUser';
import { InviteLink } from './users/InviteLink/InviteLink';
import UsersAdmin from './users/UsersAdmin';

export const Admin = () => (
    <>
        <AdminMenu />
        <Routes>
            <Route path="users" element={<UsersAdmin />} />
            <Route path="create-project-role" element={<CreateProjectRole />} />
            <Route path="roles/:id/edit" element={<EditProjectRole />} />
            <Route path="api" element={<ApiTokenPage />} />
            <Route path="api/create-token" element={<CreateApiToken />} />
            <Route path="users/:id/edit" element={<EditUser />} />
            <Route path="service-accounts" element={<ServiceAccounts />} />
            <Route path="create-user" element={<CreateUser />} />
            <Route path="invite-link" element={<InviteLink />} />
            <Route path="groups" element={<GroupsAdmin />} />
            <Route path="groups/create-group" element={<CreateGroup />} />
            <Route
                path="groups/:groupId/edit"
                element={<EditGroupContainer />}
            />
            <Route path="groups/:groupId" element={<Group />} />
            <Route path="roles" element={<ProjectRoles />} />
            <Route path="instance" element={<InstanceAdmin />} />
            <Route path="network/*" element={<Network />} />
            <Route path="maintenance" element={<MaintenanceAdmin />} />
            <Route path="cors" element={<CorsAdmin />} />
            <Route path="auth" element={<AuthSettings />} />
            <Route path="admin-invoices" element={<FlaggedBillingRedirect />} />
            <Route path="billing" element={<Billing />} />
        </Routes>
    </>
);
