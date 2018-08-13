import React from 'react';
import Archive from '../../component/archive/archive-list-container';
import PropTypes from 'prop-types';

const render = ({ match: { params }, history }) => <Archive name={params.name} history={history} />;
render.propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
};

export default render;
