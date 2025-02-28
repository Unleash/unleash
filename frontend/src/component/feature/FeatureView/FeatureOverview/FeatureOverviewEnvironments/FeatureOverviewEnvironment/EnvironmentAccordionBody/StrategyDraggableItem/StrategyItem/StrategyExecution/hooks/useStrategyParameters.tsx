import { type FC, useMemo } from 'react';
import { StrategyEvaluationChip } from 'component/common/ConstraintsList/StrategyEvaluationChip/StrategyEvaluationChip';
import {
    parseParameterNumber,
    parseParameterStrings,
} from 'utils/parseParameter';
import { StrategyEvaluationItem } from 'component/common/ConstraintsList/StrategyEvaluationItem/StrategyEvaluationItem';
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
            <StrategyEvaluationChip label={`${percentage}%`} /> of your base{' '}
            {stickiness}
            <span>
                {hasConstraints ? 'who match constraints ' : ' '}
                is included.
            </span>
            {displayGroupId && parameters?.groupId ? (
                <StrategyEvaluationChip
                    label={`groupId: ${parameters?.groupId}`}
                />
            ) : null}
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
        const type = key.toLocaleLowerCase();

        if (type === 'rollout') {
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

        if (['userids', 'hostnames', 'ips'].includes(type)) {
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
