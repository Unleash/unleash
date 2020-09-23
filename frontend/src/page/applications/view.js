import React from 'react';
import PropTypes from 'prop-types';
import ApplicationEditComponent from '../../component/application/application-edit-container';

const render = ({ match: { params }, history }) => <ApplicationEditComponent appName={params.name} history={history} />;

render.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default render;
