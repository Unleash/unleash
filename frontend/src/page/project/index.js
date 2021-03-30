import React from 'react';
import ProjectList from '../../component/project/ProjectList';
import PropTypes from 'prop-types';

const render = ({ history }) => <ProjectList history={history} />;

render.propTypes = {
    history: PropTypes.object.isRequired,
};

export default render;
