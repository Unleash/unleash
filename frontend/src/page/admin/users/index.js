import React from 'react';
import PropTypes from 'prop-types';
import UsersList from './users-list-container';
import AdminMenu from '../admin-menu';

const render = () => (
    <div>
        <AdminMenu />
        <h3>Users</h3>
        <UsersList />
    </div>
);

render.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default render;
