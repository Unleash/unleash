import React from 'react';
import PropTypes from 'prop-types';

import StrategyCardConstraints from '../common/StrategyCardConstraints';

import { useCommonStyles } from '../../../../../../common.styles';
import ConditionallyRender from '../../../../../common/ConditionallyRender';
import StrategyCardList from '../common/StrategyCardList/StrategyCardList';

const StrategyCardContentList = ({ strategy, parameter, valuesName }) => {
    const commonStyles = useCommonStyles();

    const { parameters, constraints } = strategy;
    const list = parameters[parameter].split(',').filter(user => user);

    return (
        <div>
            <StrategyCardConstraints constraints={constraints} />

            <ConditionallyRender
                condition={list.length > 0}
                show={
                    <>
                        <div className={commonStyles.divider} />
                        <StrategyCardList list={list} valuesName={valuesName} />
                    </>
                }
            />
        </div>
    );
};

StrategyCardContentList.propTypes = {
    strategy: PropTypes.object.isRequired,
    parameter: PropTypes.string.isRequired,
    valuesName: PropTypes.string.isRequired,
};

export default StrategyCardContentList;
