import type { IFeatureToggle } from 'interfaces/featureToggle';
import type { IFeatureStrategy, StrategyFormState } from 'interfaces/strategy';
import type { CreateFeatureStrategySchema } from 'openapi/index.js';
import { omitUndefined } from 'utils/omitUndefined';

export const createStrategyPayload = (
    strategy: StrategyFormState,
): CreateFeatureStrategySchema => ({
    name: strategy.name,
    title: strategy.title,
    constraints: strategy.constraints ?? [],
    parameters: omitUndefined(strategy.parameters ?? {}),
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
