import React from 'react';
import PropTypes from 'prop-types';

import StrategyCardPercentage from '../common/StrategyCardPercentage/StrageyCardPercentage';
import StrategyCardConstraints from '../common/StrategyCardConstraints';

import { useCommonStyles } from '../../../../../../common.styles';

const StrategyCardContentGradRandom = ({ strategy }) => {
    const commonStyles = useCommonStyles();

    const rolloutPercentage = strategy.parameters.percentage;
    const { constraints } = strategy;

    return (
        <div>
            <StrategyCardConstraints constraints={constraints} />
            <div className={commonStyles.divider} />
            <StrategyCardPercentage percentage={rolloutPercentage} />
        </div>
    );
};

StrategyCardContentGradRandom.propTypes = {
    strategy: PropTypes.object.isRequired,
};

export default StrategyCardContentGradRandom;
