import React from 'react';
import EditProject from '../../component/project/edit-project-container';
import PropTypes from 'prop-types';

const render = ({ match: { params }, history }) => (
    <EditProject projectId={params.id} title="Edit project" history={history} />
);

render.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default render;
