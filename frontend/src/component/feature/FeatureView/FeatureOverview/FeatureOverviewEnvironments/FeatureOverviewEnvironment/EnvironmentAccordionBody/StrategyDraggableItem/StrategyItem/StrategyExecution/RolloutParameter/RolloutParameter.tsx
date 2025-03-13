import { StrategyEvaluationChip } from 'component/common/ConstraintsList/StrategyEvaluationChip/StrategyEvaluationChip';
import { StrategyEvaluationItem } from 'component/common/ConstraintsList/StrategyEvaluationItem/StrategyEvaluationItem';
import type { ParametersSchema, StrategyVariantSchema } from 'openapi';
import type { FC } from 'react';
import { parseParameterNumber } from 'utils/parseParameter';
import { RolloutVariants } from './RolloutVariants/RolloutVariants';

export const RolloutParameter: FC<{
    value: string;
    parameters?: ParametersSchema;
    hasConstraints?: boolean;
    variants?: StrategyVariantSchema[];
    displayGroupId?: boolean;
}> = ({ value, parameters, hasConstraints, variants, displayGroupId }) => {
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
            <RolloutVariants variants={variants} />
        </>
    );
};
