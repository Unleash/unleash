import React from 'react';
import EditTagType from './../../component/tag-types/edit-tag-type-container';
import PropTypes from 'prop-types';

const render = ({ match: { params }, history }) => (
    <EditTagType tagTypeName={params.name} title="Edit Tag type" history={history} />
);
render.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default render;
