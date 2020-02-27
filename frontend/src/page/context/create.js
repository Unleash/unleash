import React from 'react';
import CreateContextField from '../../component/context/create-context-container';
import PropTypes from 'prop-types';

const render = ({ history }) => <CreateContextField title="Create context field" history={history} />;

render.propTypes = {
    history: PropTypes.object.isRequired,
};

export default render;
