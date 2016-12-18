import React from 'react';
import ShowStrategy from '../../component/strategies/strategy-details-container';

const render = ({ params }) => <ShowStrategy strategyName={params.strategyName} activeTab={params.activeTab} />;

export default render;
