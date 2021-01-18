import React from 'react';
import TagTypes from '../../component/tag-types/list-container';
import PropTypes from 'prop-types';

const render = ({ history }) => <TagTypes history={history} />;

render.propTypes = {
    history: PropTypes.object.isRequired,
};

export default render;
