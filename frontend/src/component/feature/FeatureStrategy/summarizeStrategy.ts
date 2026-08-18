import type { IConstraint, StrategyFormState } from 'interfaces/strategy';
import { isMultiValueOperator } from 'constants/operators';

const countConstraintValues = ({ operator, values, value }: IConstraint) =>
    isMultiValueOperator(operator)
        ? (values?.length ?? 0)
        : Number(Boolean(value));

const summarizeConstraint = (constraint: IConstraint) => ({
    contextName: constraint.contextName,
    operator: constraint.operator,
    inverted: Boolean(constraint.inverted),
    caseInsensitive: Boolean(constraint.caseInsensitive),
    valueCount: countConstraintValues(constraint),
});

const summarizeVariants = (variants: StrategyFormState['variants']) =>
    variants?.map((variant) => ({
        name: variant.name,
        stickiness: variant.stickiness,
        weight: variant.weight,
        weightType: variant.weightType,
        overrides: variant.overrides?.map(({ contextName, values }) => ({
            contextName,
            valueCount: values?.length ?? 0,
        })),
        payloadType: variant.payload?.type ?? null,
    }));

export const summarizeStrategy = (strategy: StrategyFormState | null) => {
    if (!strategy) return null;

    const constraints = strategy.constraints ?? [];
    const parameters = strategy.parameters ?? {};

    return {
        strategyType: strategy.name,
        title: strategy.title ?? null,
        disabled: Boolean(strategy.disabled),
        constraints: constraints.map(summarizeConstraint),
        variants: summarizeVariants(strategy.variants),
        segmentCount: strategy.segments?.length ?? 0,
        parameters,
    };
};
