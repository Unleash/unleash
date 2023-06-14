import { useContext } from 'react';
import AccessContext from 'contexts/AccessContext';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { RolesTable } from './RolesTable/RolesTable';
import { AdminAlert } from 'component/common/AdminAlert/AdminAlert';

export const Roles = () => {
    const { hasAccess } = useContext(AccessContext);

    return (
        <div>
            <ConditionallyRender
                condition={hasAccess(ADMIN)}
                show={<RolesTable />}
                elseShow={<AdminAlert />}
            />
        </div>
    );
};
