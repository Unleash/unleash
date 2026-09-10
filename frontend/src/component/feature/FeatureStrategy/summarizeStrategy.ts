import type { IConstraint, StrategyFormState } from 'interfaces/strategy';
import { isMultiValueOperator } from 'constants/operators';
import { BuiltInStrategies } from 'utils/strategyNames';

// A custom strategy name is something the customer typed, so only built-in names are sent.
const foldStrategyType = (name: string) =>
    BuiltInStrategies.includes(name) ? name : 'custom';

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

type StrategyShape = Pick<
    StrategyFormState,
    'name' | 'constraints' | 'segments' | 'variants'
>;

export const strategyShapeProps = (strategy: StrategyShape) => ({
    strategyType: foldStrategyType(strategy.name),
    constraintCount: strategy.constraints?.length ?? 0,
    segmentCount: strategy.segments?.length ?? 0,
    variantCount: strategy.variants?.length ?? 0,
});

export const summarizeStrategy = (strategy: StrategyFormState | null) => {
    if (!strategy) return null;

    const constraints = strategy.constraints ?? [];
    const parameters = strategy.parameters ?? {};

    return {
        strategyType: foldStrategyType(strategy.name),
        title: strategy.title ?? null,
        disabled: Boolean(strategy.disabled),
        constraints: constraints.map(summarizeConstraint),
        variants: summarizeVariants(strategy.variants),
        segmentCount: strategy.segments?.length ?? 0,
        parameters,
    };
};
