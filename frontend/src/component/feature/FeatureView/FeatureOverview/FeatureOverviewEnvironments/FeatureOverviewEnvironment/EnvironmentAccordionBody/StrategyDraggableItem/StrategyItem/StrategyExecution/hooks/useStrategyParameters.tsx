import { type FC, useMemo } from 'react';
import { StrategyEvaluation } from '../StrategyEvaluationChip/StrategyEvaluationChip';
import {
    parseParameterNumber,
    parseParameterStrings,
} from 'utils/parseParameter';
import { StrategyEvaluationItem } from '../StrategyEvaluationItem/StrategyEvaluationItem';
import type { IFeatureStrategyPayload } from 'interfaces/strategy';
import type { CreateFeatureStrategySchema } from 'openapi';

const RolloutParameter: FC<{
    value?: string | number;
    parameters?: (
        | IFeatureStrategyPayload
        | CreateFeatureStrategySchema
    )['parameters'];
    hasConstraints?: boolean;
    displayGroupId?: boolean;
}> = ({ value, parameters, hasConstraints, displayGroupId }) => {
    const percentage = parseParameterNumber(value);

    const explainStickiness =
        typeof parameters?.stickiness === 'string' &&
        parameters?.stickiness !== 'default';
    const stickiness = explainStickiness ? (
        <>
            with <strong>{parameters.stickiness}</strong>
        </>
    ) : (
        ''
    );

    return (
        <StrategyEvaluationItem type='Rollout %'>
            <StrategyEvaluation label={`${percentage}%`} /> of your base{' '}
            {stickiness}
            <span>
                {hasConstraints ? 'who match constraints ' : ' '}
                is included.
            </span>
            {/* TODO: displayGroupId */}
        </StrategyEvaluationItem>
    );
};

export const useStrategyParameters = (
    strategy: IFeatureStrategyPayload | CreateFeatureStrategySchema,
    displayGroupId?: boolean,
) => {
    const { constraints } = strategy;
    const { parameters } = strategy;
    const hasConstraints = Boolean(constraints?.length);
    const parameterKeys = parameters ? Object.keys(parameters) : [];
    const mapPredefinedStrategies = (key: string) => {
        if (key === 'rollout' || key === 'Rollout') {
            return (
                <RolloutParameter
                    key={key}
                    value={parameters?.[key]}
                    parameters={parameters}
                    hasConstraints={hasConstraints}
                    displayGroupId={displayGroupId}
                />
            );
        }

        if (
            ['userIds', 'UserIds', 'hostNames', 'HostNames', 'IPs'].includes(
                key,
            )
        ) {
            return (
                <StrategyEvaluationItem
                    key={key}
                    type={key}
                    values={parseParameterStrings(parameters?.[key])}
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
                    <RolloutParameter value={100} />
                ) : null,
            ].filter(Boolean),
        [parameters, hasConstraints, displayGroupId],
    );
};
