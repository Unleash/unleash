import { useContext } from 'react';
import PropTypes from 'prop-types';
import InvoiceList from './invoice-container';
import AccessContext from '../../../contexts/AccessContext';
import { ADMIN } from '../../providers/AccessProvider/permissions';
import ConditionallyRender from '../../common/ConditionallyRender';
import { Alert } from '@material-ui/lab';

const InvoiceAdminPage = ({ history }) => {
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

InvoiceAdminPage.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default InvoiceAdminPage;
