import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

const render = () => <Redirect to="/admin/users" />;

render.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default render;
