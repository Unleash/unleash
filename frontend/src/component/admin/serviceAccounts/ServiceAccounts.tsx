import { useContext } from 'react';
import AdminMenu from '../menu/AdminMenu';
import AccessContext from 'contexts/AccessContext';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { AdminAlert } from 'component/common/AdminAlert/AdminAlert';
import { ServiceAccountsTable } from './ServiceAccountsTable/ServiceAccountsTable';

export const ServiceAccounts = () => {
    const { hasAccess } = useContext(AccessContext);

    return (
        <div>
            <AdminMenu />
            <ConditionallyRender
                condition={hasAccess(ADMIN)}
                show={<ServiceAccountsTable />}
                elseShow={<AdminAlert />}
            />
        </div>
    );
};
