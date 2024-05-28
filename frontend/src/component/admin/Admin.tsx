import { Routes, Route } from 'react-router-dom';
import { ApiTokenPage } from './apiToken/ApiTokenPage/ApiTokenPage';
import { CreateApiToken } from './apiToken/CreateApiToken/CreateApiToken';
import { AuthSettings } from './auth/AuthSettings';
import { Billing } from './billing/Billing';
import FlaggedBillingRedirect from './billing/FlaggedBillingRedirect/FlaggedBillingRedirect';
import { CorsAdmin } from './cors';
import { GroupsAdmin } from './groups/GroupsAdmin';
import { InstanceAdmin } from './instance-admin/InstanceAdmin';
import { InstancePrivacy } from './instance-privacy/InstancePrivacy';
import { MaintenanceAdmin } from './maintenance';
import { Network } from './network/Network';
import { Roles } from './roles/Roles';
import { ServiceAccounts } from './serviceAccounts/ServiceAccounts';
import CreateUser from './users/CreateUser/CreateUser';
import { InviteLink } from './users/InviteLink/InviteLink';
import UsersAdmin from './users/UsersAdmin';
import NotFound from 'component/common/NotFound/NotFound';
import { AdminIndex } from './AdminIndex';
import { AdminTabsMenu } from './menu/AdminTabsMenu';
import { Banners } from './banners/Banners';
import { License } from './license/License';
import { useUiFlag } from 'hooks/useUiFlag';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

export const Admin = () => {
    const sidebarNavigationEnabled = useUiFlag('navigationSidebar');

    return (
        <>
            <ConditionallyRender
                condition={!sidebarNavigationEnabled}
                show={<AdminTabsMenu />}
            />
            <Routes>
                <Route index element={<AdminIndex />} />
                <Route path='users/*' element={<UsersAdmin />} />
                <Route path='api' element={<ApiTokenPage />} />
                <Route path='api/create-token' element={<CreateApiToken />} />
                <Route path='service-accounts' element={<ServiceAccounts />} />
                <Route path='create-user' element={<CreateUser />} />
                <Route path='invite-link' element={<InviteLink />} />
                <Route path='groups/*' element={<GroupsAdmin />} />
                <Route path='roles/*' element={<Roles />} />
                <Route path='instance' element={<InstanceAdmin />} />
                <Route path='network/*' element={<Network />} />
                <Route path='maintenance' element={<MaintenanceAdmin />} />
                <Route path='banners' element={<Banners />} />
                <Route path='license' element={<License />} />
                <Route path='cors' element={<CorsAdmin />} />
                <Route path='auth' element={<AuthSettings />} />
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
