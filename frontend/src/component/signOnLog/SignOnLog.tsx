import { useContext } from 'react';
import AccessContext from 'contexts/AccessContext';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { AdminAlert } from 'component/common/AdminAlert/AdminAlert';
import { SignOnLogTable } from './SignOnLogTable/SignOnLogTable';

export const SignOnLog = () => {
    const { hasAccess } = useContext(AccessContext);

    return (
        <div>
            <ConditionallyRender
                condition={hasAccess(ADMIN)}
                show={<SignOnLogTable />}
                elseShow={<AdminAlert />}
            />
        </div>
    );
};
