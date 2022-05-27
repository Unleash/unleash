import { useContext } from 'react';
import AccessContext from 'contexts/AccessContext';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { READ_API_TOKEN } from 'component/providers/AccessProvider/permissions';
import { AdminAlert } from 'component/common/AdminAlert/AdminAlert';
import { ApiTokenTable } from 'component/admin/apiToken/ApiTokenTable/ApiTokenTable';

export const ApiTokenPage = () => {
    const { hasAccess } = useContext(AccessContext);

    return (
        <ConditionallyRender
            condition={hasAccess(READ_API_TOKEN)}
            show={() => <ApiTokenTable />}
            elseShow={() => <AdminAlert />}
        />
    );
};
