import React from 'react';
import PropTypes from 'prop-types';

export default function DefaultStrategy({ strategyDefinition }) {
    return <h6>{strategyDefinition.description}</h6>;
}

DefaultStrategy.propTypes = {
    strategyDefinition: PropTypes.object.isRequired,
};
