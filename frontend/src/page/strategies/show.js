import React from 'react';
import PropTypes from 'prop-types';
import ShowStrategy from '../../component/strategies/strategy-details-container';

const render = ({ match: { params }, history }) => (
    <ShowStrategy strategyName={params.strategyName} activeTab={params.activeTab} history={history} />
);

render.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default render;
