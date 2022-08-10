import { PlaygroundFeatureSchema } from 'component/playground/Playground/interfaces/playground.model';

export const DEFAULT_STRATEGIES = [
    'default',
    'applicationHostname',
    'flexibleRollout',
    'gradualRolloutRandom',
    'gradualRolloutSessionId',
    'gradualRolloutUserId',
    'remoteAddress',
    'userWithId',
];

export function checkForEmptyValues(object?: Object): boolean {
    if (object === undefined) {
        return true;
    }
    return Object.values(object).every(v =>
        v && typeof v === 'object' ? checkForEmptyValues(v) : v === null
    );
}

export const hasCustomStrategies = (feature: PlaygroundFeatureSchema) => {
    return feature.strategies?.data?.find(
        strategy => !DEFAULT_STRATEGIES.includes(strategy.name)
    );
};

export const hasOnlyCustomStrategies = (feature: PlaygroundFeatureSchema) => {
    return !feature.strategies?.data?.find(strategy =>
        DEFAULT_STRATEGIES.includes(strategy.name)
    );
};
