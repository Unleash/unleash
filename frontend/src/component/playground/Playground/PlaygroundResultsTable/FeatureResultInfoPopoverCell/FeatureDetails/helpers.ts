import type { PlaygroundFeatureSchema } from 'openapi';
import { BuiltInStrategies } from 'utils/strategyNames';

export function checkForEmptyValues(object?: Object): boolean {
    if (object === undefined) {
        return true;
    }
    return Object.values(object).every((v) =>
        v && typeof v === 'object' ? checkForEmptyValues(v) : v === null,
    );
}

export const hasCustomStrategies = (feature: PlaygroundFeatureSchema) => {
    return feature.strategies?.data?.find(
        (strategy) => !BuiltInStrategies.includes(strategy.name),
    );
};

export const hasOnlyCustomStrategies = (feature: PlaygroundFeatureSchema) => {
    return (
        feature.strategies?.data?.length > 0 &&
        !feature.strategies?.data?.find((strategy) =>
            BuiltInStrategies.includes(strategy.name),
        )
    );
};
