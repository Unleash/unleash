import type { FC } from 'react';
import { StrategyEvaluationChip } from 'component/common/ConstraintsList/StrategyEvaluationChip/StrategyEvaluationChip';
import { StrategyEvaluationItem } from 'component/common/ConstraintsList/StrategyEvaluationItem/StrategyEvaluationItem';
import type { ParametersSchema } from 'openapi';
import { parseParameterNumber } from 'utils/parseParameter';

export const RolloutParameter: FC<{
    value: string;
    parameters?: ParametersSchema;
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
        <>
            <StrategyEvaluationItem type='Rollout %'>
                <StrategyEvaluationChip label={`${percentage}%`} />
                <p>
                    of your base {stickiness}{' '}
                    <span>
                        {hasConstraints ? 'who match constraints ' : ' '}
                        is included.
                    </span>
                    {displayGroupId && parameters?.groupId ? (
                        <StrategyEvaluationChip
                            label={`groupId: ${parameters?.groupId}`}
                            component='span'
                        />
                    ) : null}
                </p>
            </StrategyEvaluationItem>
        </>
    );
};
