import React from 'react';
import PropTypes from 'prop-types';

import StrategyCardPercentage from '../common/StrategyCardPercentage/StrageyCardPercentage';
import StrategyCardConstraints from '../common/StrategyCardConstraints/StrategyCardConstraints';
import StrategyCardField from '../common/StrategyCardField/StrategyCardField';

import { useCommonStyles } from '../../../../../../common.styles';
import ConditionallyRender from '../../../../../common/ConditionallyRender';

const StrategyCardContentRollout = ({ strategy }) => {
    const commonStyles = useCommonStyles();

    const rolloutPercentage = strategy.parameters.percentage;
    const groupId = strategy.parameters.groupId;
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

            <div className={commonStyles.divider} />
            <StrategyCardField title="Group id" value={groupId} />
        </div>
    );
};

StrategyCardContentRollout.propTypes = {
    strategy: PropTypes.object.isRequired,
};

export default StrategyCardContentRollout;
