import React from 'react';
import AddTagType from '../../component/tag-types/create-tag-type-container';
import PropTypes from 'prop-types';

const render = ({ history }) => <AddTagType title="Add tag type" history={history} />;

render.propTypes = {
    history: PropTypes.object.isRequired,
};

export default render;
