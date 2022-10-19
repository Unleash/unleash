import { useContext } from 'react';
import UsersList from './UsersList/UsersList';
import AdminMenu from '../menu/AdminMenu';
import AccessContext from 'contexts/AccessContext';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { AdminAlert } from 'component/common/AdminAlert/AdminAlert';
import { InviteLinkBar } from './InviteLinkBar/InviteLinkBar';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

const UsersAdmin = () => {
    const { hasAccess } = useContext(AccessContext);
    const { uiConfig } = useUiConfig();

    return (
        <div>
            <AdminMenu />
            <ConditionallyRender
                condition={Boolean(uiConfig?.flags?.publicSignup)}
                show={<InviteLinkBar />}
            />
            <ConditionallyRender
                condition={hasAccess(ADMIN)}
                show={<UsersList />}
                elseShow={<AdminAlert />}
            />
        </div>
    );
};

export default UsersAdmin;
