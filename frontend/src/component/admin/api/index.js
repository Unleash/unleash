import PropTypes from 'prop-types';
import { ApiTokenList } from '../api-token/ApiTokenList/ApiTokenList';
import AdminMenu from '../menu/AdminMenu';
import ConditionallyRender from '../../common/ConditionallyRender';
import AccessContext from '../../../contexts/AccessContext';
import { useContext } from 'react';

const ApiPage = ({ history }) => {
    const { isAdmin } = useContext(AccessContext);

    return (
        <div>
            <ConditionallyRender
                condition={isAdmin}
                show={<AdminMenu history={history} />}
            />
            <ApiTokenList />
        </div>
    );
};

ApiPage.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default ApiPage;
