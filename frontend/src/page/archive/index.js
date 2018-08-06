import React from 'react';
import Archive from '../../component/archive/archive-list-container';
import PropTypes from 'prop-types';

const render = ({ match }) => <Archive name={match.params.name} />;
render.propTypes = {
    match: PropTypes.object,
};

export default render;
