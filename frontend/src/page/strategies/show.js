import React from 'react';
import PropTypes from 'prop-types';
import ShowStrategy from '../../component/strategies/strategy-details-container';

const render = ({ params }) => (
    <ShowStrategy
        strategyName={params.strategyName}
        activeTab={params.activeTab}
    />
);

render.propTypes = {
    params: PropTypes.object.isRequired,
};

export default render;
