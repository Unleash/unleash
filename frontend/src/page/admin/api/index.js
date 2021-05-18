import PropTypes from 'prop-types';
import ApiKeyList from './api-key-list-container';

import AdminMenu from '../admin-menu';

const render = ({ history }) => {
    return (
        <div>
            <AdminMenu history={history} />
            <ApiKeyList />
        </div>
    );
};

render.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default render;
