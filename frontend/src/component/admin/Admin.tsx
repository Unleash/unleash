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
import { InstancePrivacy } from './instance-privacy/InstancePrivacy';
import { MaintenanceAdmin } from './maintenance';
import { AdminTabsMenu } from './menu/AdminTabsMenu';
import { Network } from './network/Network';
import { Roles } from './roles/Roles';
import { ServiceAccounts } from './serviceAccounts/ServiceAccounts';
import CreateUser from './users/CreateUser/CreateUser';
import EditUser from './users/EditUser/EditUser';
import { InviteLink } from './users/InviteLink/InviteLink';
import UsersAdmin from './users/UsersAdmin';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';

export const Admin = () => {
    const { isEnterprise } = useUiConfig();

    return (
        <>
            <AdminTabsMenu />
            <Routes>
                <Route path="users" element={<UsersAdmin />} />
                <Route path="api" element={<ApiTokenPage />} />
                <Route path="api/create-token" element={<CreateApiToken />} />
                <Route path="users/:id/edit" element={<EditUser />} />
                <Route
                    path="service-accounts"
                    element={
                        isEnterprise() ? (
                            <ServiceAccounts />
                        ) : (
                            <PremiumFeature feature="service-accounts" page />
                        )
                    }
                />
                <Route path="create-user" element={<CreateUser />} />
                <Route path="invite-link" element={<InviteLink />} />
                <Route path="groups" element={<GroupsAdmin />} />
                <Route path="groups/create-group" element={<CreateGroup />} />
                <Route
                    path="groups/:groupId/edit"
                    element={<EditGroupContainer />}
                />
                <Route path="groups/:groupId" element={<Group />} />
                <Route
                    path="roles/*"
                    element={
                        isEnterprise() ? (
                            <Roles />
                        ) : (
                            <PremiumFeature feature="project-roles" page />
                        )
                    }
                />
                <Route path="instance" element={<InstanceAdmin />} />
                <Route path="network/*" element={<Network />} />
                <Route path="maintenance" element={<MaintenanceAdmin />} />
                <Route path="cors" element={<CorsAdmin />} />
                <Route path="auth" element={<AuthSettings />} />
                <Route
                    path="admin-invoices"
                    element={<FlaggedBillingRedirect />}
                />
                <Route path="billing" element={<Billing />} />
                <Route path="instance-privacy" element={<InstancePrivacy />} />
            </Routes>
        </>
    );
};
