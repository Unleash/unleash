import React from 'react';
import ViewProject from '../../component/project/ProjectView';
import PropTypes from 'prop-types';

const render = ({ match: { params }, history }) => (
    <ViewProject projectId={params.id} title="View project" history={history} />
);

render.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default render;
