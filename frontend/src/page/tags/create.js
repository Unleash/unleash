import React from 'react';
import AddTag from '../../component/tags/create-tag-container';
import PropTypes from 'prop-types';

const render = ({ history }) => <AddTag title="Add Tag" history={history} />;

render.propTypes = {
    history: PropTypes.object.isRequired,
};

export default render;
