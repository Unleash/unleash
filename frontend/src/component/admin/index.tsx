import React from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

const render = () => <Navigate to="/admin/users" replace />;

render.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default render;
