import React from 'react';
import ProjectList from '../../component/project/list-container';
import PropTypes from 'prop-types';

const render = ({ history }) => <ProjectList history={history} />;

render.propTypes = {
    history: PropTypes.object.isRequired,
};

export default render;
