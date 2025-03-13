import { useMemo } from 'react';
import { parseParameterStrings } from 'utils/parseParameter';
import { StrategyEvaluationItem } from 'component/common/ConstraintsList/StrategyEvaluationItem/StrategyEvaluationItem';
import type { FeatureStrategySchema } from 'openapi';
import { RolloutParameter } from '../RolloutParameter/RolloutParameter';

export const useStrategyParameters = (
    strategy: Partial<FeatureStrategySchema>,
    displayGroupId?: boolean,
) => {
    const { constraints, variants } = strategy;
    const { parameters } = strategy;
    const hasConstraints = Boolean(constraints?.length);
    const parameterKeys = parameters ? Object.keys(parameters) : [];
    const mapPredefinedStrategies = (key: string) => {
        const type = key.toLocaleLowerCase();
        const value = parameters?.[key] || '';

        if (type === 'rollout') {
            return (
                <RolloutParameter
                    key={key}
                    value={value}
                    parameters={parameters}
                    hasConstraints={hasConstraints}
                    displayGroupId={displayGroupId}
                    variants={variants}
                />
            );
        }

        if (['userids', 'hostnames', 'ips'].includes(type)) {
            return (
                <StrategyEvaluationItem
                    key={key}
                    type={key}
                    values={parseParameterStrings(value)}
                />
            );
        }

        return null;
    };

    return useMemo(
        () =>
            [
                ...parameterKeys.map(mapPredefinedStrategies),
                strategy.name === 'default' ? (
                    <RolloutParameter value='100' />
                ) : null,
            ].filter(Boolean),
        [parameters, hasConstraints, displayGroupId],
    );
};
