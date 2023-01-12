import { useContext } from 'react';
import UsersList from './UsersList/UsersList';
import AccessContext from 'contexts/AccessContext';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { AdminAlert } from 'component/common/AdminAlert/AdminAlert';
import { InviteLinkBar } from './InviteLinkBar/InviteLinkBar';

export const UsersAdmin = () => {
    const { hasAccess } = useContext(AccessContext);

    return (
        <div>
            <InviteLinkBar />
            <ConditionallyRender
                condition={hasAccess(ADMIN)}
                show={<UsersList />}
                elseShow={<AdminAlert />}
            />
        </div>
    );
};

export default UsersAdmin;
