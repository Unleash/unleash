import React from 'react';
import ContextFields from '../../component/context/list-container';
import PropTypes from 'prop-types';

const render = ({ history }) => <ContextFields history={history} />;

render.propTypes = {
    history: PropTypes.object.isRequired,
};

export default render;
