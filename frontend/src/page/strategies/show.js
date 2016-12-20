import React, { PropTypes } from 'react';
import ShowStrategy from '../../component/strategies/strategy-details-container';

const render = ({ params }) => <ShowStrategy strategyName={params.strategyName} activeTab={params.activeTab} />;

render.propTypes = {
    params: PropTypes.object.isRequired,
};

export default render;
