import type { IFeatureToggle } from 'interfaces/featureToggle';
import type {
    IFeatureStrategy,
    StrategyFormParameters,
    StrategyFormState,
} from 'interfaces/strategy';
import type {
    CreateFeatureStrategySchema,
    ParametersSchema,
} from 'openapi/index.js';

const isDefined = (
    parameter: [string, string | undefined],
): parameter is [string, string] => parameter[1] !== undefined;

const dropUndefined = (
    parameters: StrategyFormParameters = {},
): ParametersSchema =>
    Object.fromEntries(Object.entries(parameters).filter(isDefined));

export const createStrategyPayload = (
    strategy: StrategyFormState,
): CreateFeatureStrategySchema => ({
    name: strategy.name,
    title: strategy.title,
    constraints: strategy.constraints ?? [],
    parameters: dropUndefined(strategy.parameters),
    variants: strategy.variants ?? [],
    segments: strategy.segments ?? [],
    disabled: strategy.disabled ?? false,
});

const environmentStrategies = (
    feature: IFeatureToggle,
    environmentId: string,
): IFeatureStrategy[] => {
    const environment = feature.environments.find(
        (env) => env.name === environmentId,
    );
    if (!environment) {
        return [];
    }
    const milestoneStrategies = (environment.releasePlans ?? []).flatMap(
        (plan) => plan.milestones.flatMap((milestone) => milestone.strategies),
    );
    return [...environment.strategies, ...milestoneStrategies];
};

export const strategyComparisonModerator =
    (environmentId: string, strategyId: string) => (feature: IFeatureToggle) =>
        environmentStrategies(feature, environmentId).find(
            (strategy) => strategy.id === strategyId,
        );
