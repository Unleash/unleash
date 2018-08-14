import React from 'react';
import PropTypes from 'prop-types';
import ApplicationEditComponent from '../../component/application/application-edit-container';

const render = ({ match: { params } }) => <ApplicationEditComponent appName={params.name} />;

render.propTypes = {
    match: PropTypes.object.isRequired,
};

export default render;
