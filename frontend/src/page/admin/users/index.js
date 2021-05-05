import { useContext } from 'react';
import PropTypes from 'prop-types';
import UsersList from './UsersList';
import AdminMenu from '../admin-menu';
import PageContent from '../../../component/common/PageContent/PageContent';
import AccessContext from '../../../contexts/AccessContext';
import ConditionallyRender from '../../../component/common/ConditionallyRender';
import { ADMIN } from '../../../component/AccessProvider/permissions';
import { Alert } from '@material-ui/lab';

const UsersAdmin = ({ history }) => {
    const { hasAccess } = useContext(AccessContext);

    return (
        <div>
            <AdminMenu history={history} />
            <PageContent headerContent="Users">
                <ConditionallyRender
                    condition={hasAccess(ADMIN)}
                    show={<UsersList />}
                    elseShow={
                        <Alert severity="error">
                            You need instance admin to access this section.
                        </Alert>
                    }
                />
            </PageContent>
        </div>
    );
};

UsersAdmin.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default UsersAdmin;
