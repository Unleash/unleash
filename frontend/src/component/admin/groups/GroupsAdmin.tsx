import { AdminAlert } from 'component/common/AdminAlert/AdminAlert';
import { GroupsList } from './GroupsList/GroupsList';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useContext } from 'react';
import AccessContext from 'contexts/AccessContext';
import { ADMIN } from '@server/types/permissions';

export const GroupsAdmin = () => {
    const { hasAccess } = useContext(AccessContext);

    return (
        <div>
            <ConditionallyRender
                condition={hasAccess(ADMIN)}
                show={<GroupsList />}
                elseShow={<AdminAlert />}
            />
        </div>
    );
};
