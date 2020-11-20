import React from 'react';
import CreateProject from '../../component/project/create-project-container';
import PropTypes from 'prop-types';

const render = ({ history }) => <CreateProject title="Create Project" history={history} />;

render.propTypes = {
    history: PropTypes.object.isRequired,
};

export default render;
