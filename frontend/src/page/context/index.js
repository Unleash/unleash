import React from 'react';
import ContextList from '../../component/context/ContextList';
import PropTypes from 'prop-types';

const render = ({ history }) => <ContextList history={history} />;

render.propTypes = {
    history: PropTypes.object.isRequired,
};

export default render;
