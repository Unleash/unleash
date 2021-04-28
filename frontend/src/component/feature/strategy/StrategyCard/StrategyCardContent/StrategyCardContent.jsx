import React from 'react';
import PropTypes from 'prop-types';

import StrategyCardContentFlexible from './StrategyCardContentFlexible/StrategyCardContentFlexible';
import StrategyCardContentGradRandom from './StrategyCardContentGradRandom/StrategyCardContentGradRandom';
import StrategyCardContentList from './StrategyCardContentList/StrategyCardContentList';
import StrategyCardContentRollout from './StrategyCardContentRollout/StrategyCardContentRollout';
import StrategyCardContentCustom from './StrategyCardContentCustom/StrategyCardContentCustom';
import StrategyCardContentDefault from './StrategyCardContentDefault/StrategyCardContentDefault';

const StrategyCardContent = ({ strategy, strategyDefinition }) => {
    const resolveContent = () => {
        switch (strategy.name) {
            case 'default':
                return <StrategyCardContentDefault strategy={strategy} />;
            case 'flexibleRollout':
                return <StrategyCardContentFlexible strategy={strategy} />;
            case 'userWithId':
                return (
                    <StrategyCardContentList
                        parameter={'userIds'}
                        valuesName={'userIds'}
                        strategy={strategy}
                    />
                );
            case 'gradualRolloutRandom':
                return <StrategyCardContentGradRandom strategy={strategy} />;
            case 'remoteAddress':
                return (
                    <StrategyCardContentList
                        parameter={'IPs'}
                        valuesName={'IPs'}
                        strategy={strategy}
                    />
                );
            case 'applicationHostname':
                return (
                    <StrategyCardContentList
                        parameter={'hostNames'}
                        valuesName={'hostnames'}
                        strategy={strategy}
                    />
                );
            case 'gradualRolloutUserId':
            case 'gradualRolloutSessionId':
                return <StrategyCardContentRollout strategy={strategy} />;
            default:
                return (
                    <StrategyCardContentCustom
                        strategy={strategy}
                        strategyDefinition={strategyDefinition}
                    />
                );
        }
    };

    return resolveContent();
};

StrategyCardContent.propTypes = {
    strategy: PropTypes.object.isRequired,
    strategyDefinition: PropTypes.object.isRequired,
};

export default StrategyCardContent;
