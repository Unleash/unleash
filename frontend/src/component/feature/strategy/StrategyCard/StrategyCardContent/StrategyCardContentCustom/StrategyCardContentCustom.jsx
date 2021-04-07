import React from 'react';
import PropTypes from 'prop-types';

import { Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';

import StrategyCardPercentage from '../common/StrategyCardPercentage/StrageyCardPercentage';
import StrategyCardConstraints from '../common/StrategyCardConstraints/StrategyCardConstraints';

import { useCommonStyles } from '../../../../../../common.styles';
import ConditionallyRender from '../../../../../common/ConditionallyRender';
import StrategyCardList from '../common/StrategyCardList/StrategyCardList';
import StrategyCardField from '../common/StrategyCardField/StrategyCardField';

const StrategyCardContentCustom = ({ strategy, strategyDefinition }) => {
    const commonStyles = useCommonStyles();

    if (!strategyDefinition)
        return (
            <Typography className={commonStyles.textCenter}>
                The strategy definition "{strategy.name}" does not exist.{' '}
                <Link to={`/strategies/create?name=${strategy.name}`}>Create a strategy named {strategy.name}</Link>
            </Typography>
        );
    if (strategyDefinition.name === 'Loading') return null;

    const { constraints } = strategy;

    const getParam = name => strategy.parameters[name];

    const getSection = paramDefinition => {
        const param = getParam(paramDefinition.name);

        switch (paramDefinition.type) {
            case 'percentage':
                return (
                    <div key={paramDefinition.name}>
                        <StrategyCardPercentage percentage={param} />
                        <div className={commonStyles.divider} />
                    </div>
                );
            case 'list':
                /* eslint-disable-next-line */
                const paramList = param
                    ? param.split(",").filter(listItem => listItem)
                    : [];

                return (
                    <ConditionallyRender
                        key={paramDefinition.name}
                        condition={paramList.length > 0}
                        show={
                            <>
                                <StrategyCardList list={paramList} valuesName={paramDefinition.name} />
                                <div className={commonStyles.divider} />
                            </>
                        }
                    />
                );
            case 'number':
            case 'boolean':
            case 'string':
                return (
                    <ConditionallyRender
                        key={paramDefinition.name}
                        condition={param || param === false}
                        show={<StrategyCardField title={paramDefinition.name} value={param} />}
                    />
                );
            default:
                return null
        }
    };

    const renderCustomSections = () =>
        strategyDefinition.parameters.map(paramDefinition => getSection(paramDefinition));

    return (
        <div>
            {renderCustomSections()}
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

StrategyCardContentCustom.propTypes = {
    strategy: PropTypes.object.isRequired,
    strategyDefinition: PropTypes.object.isRequired,
};

export default StrategyCardContentCustom;
