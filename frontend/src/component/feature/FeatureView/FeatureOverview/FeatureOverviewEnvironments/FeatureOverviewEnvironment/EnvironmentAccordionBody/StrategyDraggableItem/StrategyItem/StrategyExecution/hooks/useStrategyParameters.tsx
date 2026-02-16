import { useMemo } from 'react';
import { StrategyEvaluationItem } from 'component/common/ConstraintsList/StrategyEvaluationItem/StrategyEvaluationItem';
import type { FeatureStrategySchema } from 'openapi';
import { RolloutParameter } from '../RolloutParameter/RolloutParameter.tsx';
import { ValuesList } from 'component/common/ConstraintsList/ValuesList/ValuesList';
import { parseParameterStrings } from 'utils/parseParameter';

export const useStrategyParameters = (
    strategy: Partial<
        Pick<
            FeatureStrategySchema,
            'name' | 'constraints' | 'variants' | 'parameters'
        >
    >,
    displayGroupId?: boolean,
) => {
    const { constraints } = strategy;
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
                />
            );
        }

        if (['userids', 'hostnames', 'ips'].includes(type)) {
            return (
                <StrategyEvaluationItem key={key} type={key}>
                    <ValuesList values={parseParameterStrings(value)} />
                </StrategyEvaluationItem>
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
