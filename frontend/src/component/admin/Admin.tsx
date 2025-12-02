import { Routes, Route } from 'react-router-dom';
import { ApiTokenPage } from './apiToken/ApiTokenPage/ApiTokenPage.tsx';
import { CreateApiToken } from './apiToken/CreateApiToken/CreateApiToken.tsx';
import { AuthSettings } from './auth/AuthSettings.tsx';
import { Billing } from './billing/Billing.tsx';
import FlaggedBillingRedirect from './billing/FlaggedBillingRedirect/FlaggedBillingRedirect.tsx';
import { CorsAdmin } from './cors/index.js';
import { GroupsAdmin } from './groups/GroupsAdmin.tsx';
import { InstanceAdmin } from './instance-admin/InstanceAdmin.tsx';
import { InstancePrivacy } from './instance-privacy/InstancePrivacy.tsx';
import { MaintenanceAdmin } from './maintenance/index.js';
import { Network } from './network/Network.tsx';
import { Roles } from './roles/Roles.tsx';
import { ServiceAccounts } from './serviceAccounts/ServiceAccounts.tsx';
import CreateUser from './users/CreateUser/CreateUser.tsx';
import { InviteLink } from './users/InviteLink/InviteLink.tsx';
import UsersAdmin from './users/UsersAdmin.tsx';
import NotFound from 'component/common/NotFound/NotFound';
import { Banners } from './banners/Banners.tsx';
import { License } from './license/License.tsx';
import { AdminHome } from './AdminHome.tsx';
import { lazy } from 'react';

const EnterpriseEdge = lazy(
    () => import('./enterprise-edge/EnterpriseEdge.tsx'),
);

export const Admin = () => {
    return (
        <>
            <Routes>
                <Route index element={<AdminHome />} />
                <Route path='users/*' element={<UsersAdmin />} />
                <Route path='api' element={<ApiTokenPage />} />
                <Route path='api/create-token' element={<CreateApiToken />} />
                <Route path='service-accounts' element={<ServiceAccounts />} />
                <Route path='create-user' element={<CreateUser />} />
                <Route path='invite-link' element={<InviteLink />} />
                <Route path='groups/*' element={<GroupsAdmin />} />
                <Route path='roles/*' element={<Roles />} />
                <Route path='instance' element={<InstanceAdmin />} />
                <Route path='enterprise-edge' element={<EnterpriseEdge />} />
                <Route path='network/*' element={<Network />} />
                <Route path='maintenance' element={<MaintenanceAdmin />} />
                <Route path='banners' element={<Banners />} />
                <Route path='license' element={<License />} />
                <Route path='cors' element={<CorsAdmin />} />
                <Route path='auth/*' element={<AuthSettings />} />
                <Route
                    path='admin-invoices'
                    element={<FlaggedBillingRedirect />}
                />
                <Route path='billing' element={<Billing />} />
                <Route path='instance-privacy' element={<InstancePrivacy />} />
                <Route path='*' element={<NotFound />} />
            </Routes>
        </>
    );
};
