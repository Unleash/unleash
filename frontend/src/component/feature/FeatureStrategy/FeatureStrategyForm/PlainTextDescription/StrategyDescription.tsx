import { styled, Typography } from '@mui/material';
import type { IConstraint, StrategyFormState } from 'interfaces/strategy';
import { useSegmentsMap } from 'hooks/api/getters/useSegments/useSegmentsMap.ts';
import { formatConstraintText } from 'utils/formatConstraintText';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { RuleList } from './RuleList.tsx';
import { VariantList, variantDisplayName } from './VariantList.tsx';

const COMPLEX_STRATEGY_DESCRIPTION_TRHESHOLD = 5;

type PlainTextStrategy = Omit<StrategyFormState, 'segments'> & {
    segments?: string[];
};

const isConstraintWithValue = (constraint: IConstraint) =>
    constraint.values?.length || constraint.value;

const usePlainTextStrategy = (
    strategy: StrategyFormState,
): PlainTextStrategy => {
    const segmentsMap = useSegmentsMap();
    return {
        ...strategy,
        segments: strategy.segments
            ?.map((segment) => segmentsMap.get(segment)?.name)
            .filter((name) => name !== undefined),
        constraints: strategy.constraints?.filter(isConstraintWithValue),
    };
};

const useTargetingDescription = ({
    constraints,
    segments,
}: Pick<PlainTextStrategy, 'constraints' | 'segments'>) => {
    const { locationSettings } = useLocationSettings();

    if (!constraints?.length && !segments?.length)
        return 'everyone in the selected environment';

    const segmentText = !segments?.length ? 'users' : segments.join(' + ');

    const describeConstraint = (constraint: IConstraint) =>
        `whose ${formatConstraintText(constraint, locationSettings)}`;

    const constraintText =
        constraints?.map(describeConstraint).join(', and ') ?? '';

    return `${segmentText} ${constraintText}`.trim();
};

const describeRollout = (parameters: PlainTextStrategy['parameters']) => {
    return `${parameters?.rollout ?? 100}%`;
};

const describeVariants = (variants: PlainTextStrategy['variants']) => {
    if (!variants?.length) return 'they all get the same experience';
    if (variants.length === 1)
        return (
            <>
                they all get <strong>{variantDisplayName(variants[0])}</strong>
            </>
        );

    return (
        <>
            they're split across <strong>{variants.length} variants</strong>
        </>
    );
};

const describeActiveState = (disabled?: boolean) => {
    if (!disabled) {
        return '';
    }
    return (
        <>
            {' '}
            is <strong>disabled</strong>. When it's enabled, it
        </>
    );
};

const StrategyDescriptionText = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: 1.6,
}));

const SimpleStrategyDescription = ({
    strategy,
}: {
    strategy: PlainTextStrategy;
}) => {
    const targetingDescription = useTargetingDescription(strategy);
    const rolloutDescription = describeRollout(strategy.parameters);
    const variantDescription = describeVariants(strategy.variants);
    const inactiveDescription = describeActiveState(strategy.disabled);

    return (
        <>
            <StrategyDescriptionText>
                This strategy{inactiveDescription} targets{' '}
                <strong>{targetingDescription}</strong>. Of them,{' '}
                <strong>{rolloutDescription}</strong> are exposed to the flag,
                and {variantDescription}.
            </StrategyDescriptionText>
            <VariantList variants={strategy.variants} />
        </>
    );
};

const ComplexStrategyDescription = ({
    strategy,
    totalRules,
}: {
    strategy: PlainTextStrategy;
    totalRules: number;
}) => {
    const rolloutDescription = describeRollout(strategy.parameters);
    const variantDescription = describeVariants(strategy.variants);
    const inactiveDescription = describeActiveState(strategy.disabled);
    return (
        <>
            <StrategyDescriptionText>
                This strategy{inactiveDescription} targets{' '}
                <strong>{rolloutDescription}</strong> of users who match{' '}
                <strong>all {totalRules} rules</strong>, and{' '}
                {variantDescription}.
            </StrategyDescriptionText>
            <RuleList
                segments={strategy.segments}
                constraints={strategy.constraints}
            />
            <VariantList variants={strategy.variants} />
        </>
    );
};

export const StrategyDescription = ({
    strategy: formState,
}: {
    strategy: StrategyFormState;
}) => {
    const strategy = usePlainTextStrategy(formState);
    const totalRules =
        (strategy.segments?.length ?? 0) + (strategy.constraints?.length ?? 0);
    if (totalRules < COMPLEX_STRATEGY_DESCRIPTION_TRHESHOLD) {
        return <SimpleStrategyDescription strategy={strategy} />;
    } else {
        return (
            <ComplexStrategyDescription
                strategy={strategy}
                totalRules={totalRules}
            />
        );
    }
};
