import { AdvancedPlaygroundFeatureSchema } from 'openapi';

export const countCombinations = (
    features: AdvancedPlaygroundFeatureSchema[]
) =>
    features.reduce(
        (total, feature) =>
            total +
            Object.values(feature.environments).flatMap(env => Object.keys(env))
                .length,
        0
    );
