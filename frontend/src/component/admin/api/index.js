import PropTypes from 'prop-types';
import ApiTokenList from '../api-token/ApiTokenList/ApiTokenList';

import AdminMenu from '../menu/AdminMenu';
import usePermissions from '../../../hooks/usePermissions';
import ConditionallyRender from '../../common/ConditionallyRender';

const ApiPage = ({ history }) => {
    const { isAdmin } = usePermissions();

    return (
        <div>
            <ConditionallyRender
                condition={isAdmin()}
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
