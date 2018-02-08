import React from 'react';
import Archive from '../../component/archive/archive-container';
import PropTypes from 'prop-types';

const render = ({ params }) => <Archive name={params.name} />;
render.propTypes = {
    params: PropTypes.object,
};

export default render;
