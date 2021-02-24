import React from 'react';
import PropTypes from 'prop-types';
import ApiKeyList from './api-key-list-container';

import AdminMenu from '../admin-menu';

const render = () => (
    <div>
        <AdminMenu />
        <h3>API Access</h3>
        <ApiKeyList />
    </div>
);

render.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default render;
