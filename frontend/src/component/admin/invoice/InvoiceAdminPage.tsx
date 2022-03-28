import { useContext } from 'react';
import InvoiceList from './InvoiceList';
import AccessContext from 'contexts/AccessContext';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import ConditionallyRender from 'component/common/ConditionallyRender';
import { Alert } from '@material-ui/lab';

const InvoiceAdminPage = () => {
    const { hasAccess } = useContext(AccessContext);
    return (
        <div>
            <ConditionallyRender
                condition={hasAccess(ADMIN)}
                show={<InvoiceList />}
                elseShow={
                    <Alert severity="error">
                        You need to be instance admin to access this section.
                    </Alert>
                }
            />
        </div>
    );
};

export default InvoiceAdminPage;
