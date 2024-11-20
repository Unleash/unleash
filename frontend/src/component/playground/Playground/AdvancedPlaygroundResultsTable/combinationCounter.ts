import type { AdvancedPlaygroundFeatureSchema } from 'openapi';

export const countCombinations = (
    features: AdvancedPlaygroundFeatureSchema[],
) =>
    features.reduce(
        (total, feature) =>
            total +
            Object.values(feature.environments).flatMap((env) =>
                Object.keys(env),
            ).length,
        0,
    );

export const getBucket = (value: number): string => {
    if (value < 0) {
        return 'invalid bucket';
    }
    if (value >= 20000) {
        return '20000+';
    } else if (value >= 10000) {
        return '10000-20000';
    } else if (value >= 1000) {
        return '1000-10000';
    } else if (value >= 100) {
        return '100-1000';
    } else {
        return '0-100';
    }
};
