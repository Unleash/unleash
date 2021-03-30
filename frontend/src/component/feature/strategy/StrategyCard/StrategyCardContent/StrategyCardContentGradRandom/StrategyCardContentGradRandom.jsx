import React from 'react';
import PropTypes from 'prop-types';

import StrategyCardPercentage from '../common/StrategyCardPercentage/StrageyCardPercentage';
import StrategyCardConstraints from '../common/StrategyCardConstraints/StrategyCardConstraints';

import { useCommonStyles } from '../../../../../../common.styles';
import ConditionallyRender from '../../../../../common/ConditionallyRender';

const StrategyCardContentGradRandom = ({ strategy }) => {
    const commonStyles = useCommonStyles();

    const rolloutPercentage = strategy.parameters.percentage;
    const { constraints } = strategy;

    return (
        <div>
            <StrategyCardPercentage percentage={rolloutPercentage} />
            <ConditionallyRender
                condition={constraints && constraints.length > 0}
                show={
                    <>
                        <div className={commonStyles.divider} />
                        <StrategyCardConstraints constraints={constraints} />
                    </>
                }
            />
        </div>
    );
};

StrategyCardContentGradRandom.propTypes = {
    strategy: PropTypes.object.isRequired,
};

export default StrategyCardContentGradRandom;
