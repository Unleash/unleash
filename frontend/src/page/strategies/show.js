import React from 'react';
import PropTypes from 'prop-types';
import ShowStrategy from '../../component/strategies/strategy-details-container';

const render = ({ match: { params } }) => (
    <ShowStrategy strategyName={params.strategyName} activeTab={params.activeTab} />
);

render.propTypes = {
    match: PropTypes.object.isRequired,
};

export default render;
