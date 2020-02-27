import React from 'react';
import CreateContextField from '../../component/context/edit-context-container';
import PropTypes from 'prop-types';

const render = ({ match: { params }, history }) => (
    <CreateContextField contextFieldName={params.name} title="Edit context field" history={history} />
);

render.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default render;
