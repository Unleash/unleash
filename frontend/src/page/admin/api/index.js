import PropTypes from 'prop-types';
import ApiKeyList from './api-key-list-container';

import AdminMenu from '../admin-menu';
import usePermissions from '../../../hooks/usePermissions';
import ConditionallyRender from '../../../component/common/ConditionallyRender';

const ApiPage = ({ history }) => {
    const { isAdmin } = usePermissions();

    return (
        <div>
            <ConditionallyRender
                condition={isAdmin()}
                show={<AdminMenu history={history} />}
            />
            <ApiKeyList />
        </div>
    );
};

ApiPage.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default ApiPage;
