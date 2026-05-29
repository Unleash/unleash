import murmurHash3 from 'murmurhash3js';
import {
    IN,
    NOT_IN,
    NUM_EQ,
    NUM_GT,
    NUM_GTE,
    NUM_LT,
    NUM_LTE,
    STR_CONTAINS,
    STR_ENDS_WITH,
    STR_STARTS_WITH,
    type Operator,
} from 'constants/operators';
import type {
    IFeatureEnvironment,
    IFeatureVariant,
} from 'interfaces/featureToggle';
import type {
    IConstraint,
    IFeatureStrategy,
    IFeatureStrategyPayload,
} from 'interfaces/strategy';

export const EXPERIMENT_STRATEGY = 'flexibleRollout';
export const DEFAULT_CONTROL_NAME = 'Control';
const VARIANT_NAME_PATTERN = /^[A-Za-z0-9._-]+$/;

export type TreatmentConstraint = Pick<
    IConstraint,
    | 'contextName'
    | 'operator'
    | 'values'
    | 'value'
    | 'inverted'
    | 'caseInsensitive'
>;

export type ExperimentTreatment = {
    name: string;
    label: string;
    properties: Record<string, string>;
};

export type ExperimentLane = {
    id?: string;
    name: string;
    constraints: TreatmentConstraint[];
    segments: number[];
    disabled: boolean;
    stickiness: string;
    weights: Record<string, number>;
};

export type ExperimentEnvironmentConfig = {
    environment: IFeatureEnvironment;
    strategies: IFeatureStrategy[];
    hasAdvancedConfiguration: boolean;
    configured: boolean;
    disabled: boolean;
    stickiness: string;
    treatments: ExperimentTreatment[];
    lanes: ExperimentLane[];
};

export const createDefaultTreatments = (): ExperimentTreatment[] => [
    {
        name: 'Control',
        label: DEFAULT_CONTROL_NAME,
        properties: {},
    },
    {
        name: 'VariantB',
        label: 'VariantB',
        properties: {},
    },
];

const createDefaultWeights = (
    treatments: ExperimentTreatment[],
): Record<string, number> => {
    if (treatments.length === 0) return {};

    const treatmentWeight = Math.floor(1000 / treatments.length / 1) / 10;
    const weights = Object.fromEntries(
        treatments.map((treatment) => [treatment.name, treatmentWeight]),
    );
    weights[treatments[0].name] =
        Math.round(
            (100 -
                Object.entries(weights)
                    .slice(1)
                    .reduce((sum, [, weight]) => sum + weight, 0)) *
                10,
        ) / 10;

    return weights;
};

export const createDefaultLanes = (
    treatments = createDefaultTreatments(),
): ExperimentLane[] => [
    {
        name: 'All traffic',
        constraints: [],
        segments: [],
        disabled: false,
        stickiness: 'default',
        weights: createDefaultWeights(treatments),
    },
];

const toPercent = (weight: number | undefined): number =>
    Math.round(weight ?? 0) / 10;

const toVariantWeight = (weight: number): number => Math.round(weight * 10);

export const createTreatmentKey = (label: string): string => {
    const key = label
        .trim()
        .replace(/[^A-Za-z0-9._-]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return key || 'variant';
};

type ParsedVariantPayload = Pick<ExperimentTreatment, 'label' | 'properties'>;

const stringifyPayloadValue = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    return JSON.stringify(value);
};

const parseVariantPayload = (
    variant: IFeatureVariant,
): ParsedVariantPayload => {
    if (variant.payload?.type !== 'json' || !variant.payload.value) {
        return { label: variant.name, properties: {} };
    }

    try {
        const parsed = JSON.parse(variant.payload.value);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            const payloadObject = parsed as Record<string, unknown>;
            const properties =
                payloadObject.properties &&
                typeof payloadObject.properties === 'object' &&
                !Array.isArray(payloadObject.properties)
                    ? (payloadObject.properties as Record<string, unknown>)
                    : payloadObject;

            return {
                label:
                    typeof payloadObject.label === 'string'
                        ? payloadObject.label
                        : variant.name,
                properties: Object.fromEntries(
                    Object.entries(properties)
                        .filter(
                            ([key]) => key !== 'label' && key !== 'constraints',
                        )
                        .map(([key, value]) => [
                            key,
                            stringifyPayloadValue(value),
                        ]),
                ),
            };
        }
    } catch (_error) {
        return { label: variant.name, properties: {} };
    }

    return { label: variant.name, properties: {} };
};

const createVariantPayload = (
    treatment: ExperimentTreatment,
): IFeatureVariant['payload'] | undefined => {
    const properties = Object.fromEntries(
        Object.entries(treatment.properties)
            .map(([key, value]) => [key.trim(), value.trim()])
            .filter(([key, value]) => key && value),
    );

    if (Object.keys(properties).length === 0) {
        return undefined;
    }

    return {
        type: 'json',
        value: JSON.stringify(properties),
    };
};

const collectTreatments = (
    strategies: IFeatureStrategy[],
): ExperimentTreatment[] => {
    const treatments = new Map<string, ExperimentTreatment>();

    strategies.forEach((strategy) => {
        (strategy.variants ?? []).forEach((variant) => {
            if (treatments.has(variant.name)) return;

            const payload = parseVariantPayload(variant);
            treatments.set(variant.name, {
                name: variant.name,
                label: payload.label,
                properties: payload.properties,
            });
        });
    });

    return Array.from(treatments.values());
};

const strategyToLane = (
    strategy: IFeatureStrategy,
    index: number,
    treatments: ExperimentTreatment[],
): ExperimentLane => {
    const defaultName =
        strategy.constraints?.length || strategy.segments?.length
            ? `Lane ${index + 1}`
            : 'All traffic';

    return {
        id: strategy.id,
        name:
            strategy.title && strategy.title !== 'Experiment'
                ? strategy.title
                : defaultName,
        constraints: (strategy.constraints ?? []) as TreatmentConstraint[],
        segments: strategy.segments ?? [],
        disabled: strategy.disabled ?? false,
        stickiness: String(strategy.parameters?.stickiness || 'default'),
        weights: Object.fromEntries(
            treatments.map((treatment) => [
                treatment.name,
                toPercent(
                    strategy.variants?.find(
                        (variant) => variant.name === treatment.name,
                    )?.weight,
                ),
            ]),
        ),
    };
};

export const resolveExperimentConfig = (
    environment: IFeatureEnvironment,
): ExperimentEnvironmentConfig => {
    const strategies = environment.strategies ?? [];
    const experimentStrategies = strategies
        .filter((strategy) => strategy.name === EXPERIMENT_STRATEGY)
        .toSorted((strategyA, strategyB) => {
            const strategyAIsFallback =
                (strategyA.constraints?.length ?? 0) === 0 &&
                (strategyA.segments?.length ?? 0) === 0;
            const strategyBIsFallback =
                (strategyB.constraints?.length ?? 0) === 0 &&
                (strategyB.segments?.length ?? 0) === 0;

            if (strategyAIsFallback !== strategyBIsFallback) {
                return strategyAIsFallback ? 1 : -1;
            }

            return (strategyA.sortOrder ?? 0) - (strategyB.sortOrder ?? 0);
        });
    const treatmentsFromStrategies = collectTreatments(experimentStrategies);
    const treatments =
        treatmentsFromStrategies.length > 0
            ? treatmentsFromStrategies
            : createDefaultTreatments();
    const lanes =
        experimentStrategies.length > 0
            ? experimentStrategies.map((strategy, index) =>
                  strategyToLane(strategy, index, treatments),
              )
            : createDefaultLanes(treatments);

    return {
        environment,
        strategies: experimentStrategies,
        hasAdvancedConfiguration: strategies.some(
            (strategy) => strategy.name !== EXPERIMENT_STRATEGY,
        ),
        configured: experimentStrategies.length > 0,
        disabled: lanes.every((lane) => lane.disabled),
        stickiness: lanes[0]?.stickiness ?? 'default',
        treatments,
        lanes,
    };
};

export const createExperimentStrategyPayload = ({
    featureId,
    lane,
    treatments,
    sortOrder,
}: {
    featureId: string;
    lane: ExperimentLane;
    treatments: ExperimentTreatment[];
    sortOrder?: number;
}): IFeatureStrategyPayload => ({
    name: EXPERIMENT_STRATEGY,
    title: lane.name.trim() || 'Experiment',
    sortOrder,
    constraints: lane.constraints as IConstraint[],
    segments: lane.segments,
    disabled: false,
    parameters: {
        rollout: '100',
        stickiness: lane.stickiness,
        groupId: featureId,
    },
    variants: treatments.map((treatment, index) => ({
        name: treatment.name.trim(),
        stickiness: lane.stickiness,
        weight: toVariantWeight(lane.weights[treatment.name] ?? 0),
        weightType: index === 0 ? 'variable' : 'fix',
        payload: createVariantPayload(treatment),
    })),
});

export const laneTotal = (lane: ExperimentLane): number =>
    Object.values(lane.weights).reduce((sum, weight) => sum + weight, 0);

export const experimentIsValid = (
    treatments: ExperimentTreatment[],
    lanes: ExperimentLane[],
): boolean => {
    const names = treatments.map((treatment) => treatment.name.trim());
    return (
        treatments.length >= 2 &&
        lanes.length >= 1 &&
        lanes.every((lane) => laneTotal(lane) === 100) &&
        names.every(Boolean) &&
        names.every((name) => VARIANT_NAME_PATTERN.test(name)) &&
        new Set(names).size === names.length
    );
};

export const getExperimentPropertyNames = (
    treatments: ExperimentTreatment[],
): string[] => {
    const propertyNames = treatments.flatMap((treatment) =>
        Object.keys(treatment.properties),
    );

    return Array.from(new Set(propertyNames));
};

export const getExperimentContextFields = (
    lanes: ExperimentLane[],
): string[] => {
    const contextFields = lanes.flatMap((lane) =>
        lane.constraints.map((constraint) => constraint.contextName),
    );

    return Array.from(new Set(contextFields.filter(Boolean)));
};

const constraintValues = (constraint: TreatmentConstraint): string[] => {
    if (constraint.values?.length) return constraint.values;
    if (constraint.value) return [constraint.value];
    return [];
};

const matchesConstraint = (
    constraint: TreatmentConstraint,
    context: Record<string, string>,
): boolean => {
    const actual = context[constraint.contextName] ?? '';
    const values = constraintValues(constraint);
    const matches = (() => {
        switch (constraint.operator as Operator) {
            case IN:
                return values.includes(actual);
            case NOT_IN:
                return !values.includes(actual);
            case STR_CONTAINS:
                return values.some((value) => actual.includes(value));
            case STR_STARTS_WITH:
                return values.some((value) => actual.startsWith(value));
            case STR_ENDS_WITH:
                return values.some((value) => actual.endsWith(value));
            case NUM_EQ:
                return values.some((value) => Number(actual) === Number(value));
            case NUM_GT:
                return values.some((value) => Number(actual) > Number(value));
            case NUM_GTE:
                return values.some((value) => Number(actual) >= Number(value));
            case NUM_LT:
                return values.some((value) => Number(actual) < Number(value));
            case NUM_LTE:
                return values.some((value) => Number(actual) <= Number(value));
            default:
                return values.includes(actual);
        }
    })();

    return constraint.inverted ? !matches : matches;
};

export const laneMatchesContext = (
    lane: ExperimentLane,
    context: Record<string, string>,
): boolean =>
    lane.constraints.every((constraint) =>
        matchesConstraint(constraint, context),
    );

const VARIANT_SEED = 86028157;

const normalizedVariantValue = (
    id: string,
    groupId: string,
    normalizer: number,
): number => {
    const hash = murmurHash3.x86.hash32(`${groupId}:${id}`, VARIANT_SEED);
    return (hash % normalizer) + 1;
};

const previewStickinessValue = (
    context: Record<string, string>,
    stickiness: string,
): string => {
    if (stickiness && stickiness !== 'default' && stickiness !== 'random') {
        return (
            context[stickiness] ||
            context.userId ||
            context.sessionId ||
            'preview'
        );
    }

    return (
        context.userId ||
        context.sessionId ||
        context.remoteAddress ||
        'preview'
    );
};

const selectWeightedTreatment = (
    treatments: ExperimentTreatment[],
    lane: ExperimentLane,
    context: Record<string, string>,
    groupId: string,
): ExperimentTreatment | undefined => {
    const weightedTreatments = treatments.filter(
        (treatment) => (lane.weights[treatment.name] ?? 0) > 0,
    );
    if (weightedTreatments.length <= 1) return weightedTreatments[0];

    const totalWeight = weightedTreatments.reduce(
        (sum, treatment) => sum + (lane.weights[treatment.name] ?? 0),
        0,
    );
    const normalizer = Math.round(totalWeight * 10);
    if (normalizer <= 0) return weightedTreatments[0];

    const bucket = normalizedVariantValue(
        previewStickinessValue(context, lane.stickiness),
        groupId,
        normalizer,
    );
    let accumulatedWeight = 0;

    return (
        weightedTreatments.find((treatment) => {
            accumulatedWeight += Math.round(
                (lane.weights[treatment.name] ?? 0) * 10,
            );
            return bucket <= accumulatedWeight;
        }) ?? weightedTreatments.at(-1)
    );
};

export const resolvePreviewTreatment = (
    treatments: ExperimentTreatment[],
    lanes: ExperimentLane[],
    context: Record<string, string>,
    options: { groupId?: string } = {},
): { lane?: ExperimentLane; treatment?: ExperimentTreatment } => {
    const groupId = options.groupId ?? 'experiment-preview';
    const matchedLane =
        lanes.find(
            (lane) =>
                lane.constraints.length > 0 &&
                laneMatchesContext(lane, context),
        ) ??
        lanes.find(
            (lane) =>
                lane.constraints.length === 0 &&
                laneMatchesContext(lane, context),
        );

    return {
        lane: matchedLane,
        treatment: matchedLane
            ? selectWeightedTreatment(treatments, matchedLane, context, groupId)
            : undefined,
    };
};
