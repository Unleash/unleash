import React from 'react';
import Tags from '../../component/tags';
import PropTypes from 'prop-types';

const render = ({ history }) => <Tags history={history} />;

render.propTypes = {
    history: PropTypes.object.isRequired,
};

export default render;
