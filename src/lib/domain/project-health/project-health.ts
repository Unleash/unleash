import { hoursToMilliseconds } from 'date-fns';
import type { IProjectHealthReport } from 'lib/types';
import type { IFeatureType } from 'lib/types/stores/feature-type-store';

type IPartialFeatures = Array<{
    stale?: boolean;
    createdAt?: Date;
    type?: string;
}>;

const getPotentiallyStaleCount = (
    features: IPartialFeatures,
    featureTypes: IFeatureType[],
) => {
    const today = new Date().valueOf();

    return features.filter((feature) => {
        const diff = today - feature.createdAt?.valueOf();
        const featureTypeExpectedLifetime = featureTypes.find(
            (t) => t.id === feature.type,
        )?.lifetimeDays;

        return (
            !feature.stale &&
            featureTypeExpectedLifetime !== null &&
            diff >= featureTypeExpectedLifetime * hoursToMilliseconds(24)
        );
    }).length;
};

export const calculateProjectHealth = (
    features: IPartialFeatures,
    featureTypes: IFeatureType[],
): Pick<
    IProjectHealthReport,
    'staleCount' | 'potentiallyStaleCount' | 'activeCount'
> => ({
    potentiallyStaleCount: getPotentiallyStaleCount(features, featureTypes),
    activeCount: features.filter((f) => !f.stale).length,
    staleCount: features.filter((f) => f.stale).length,
});

export const calculateHealthRating = (
    features: IPartialFeatures,
    featureTypes: IFeatureType[],
): number => {
    const { potentiallyStaleCount, activeCount, staleCount } =
        calculateProjectHealth(features, featureTypes);
    const toggleCount = activeCount + staleCount;

    const startPercentage = 100;
    const stalePercentage = (staleCount / toggleCount) * 100 || 0;
    const potentiallyStalePercentage =
        (potentiallyStaleCount / toggleCount) * 100 || 0;
    const rating = Math.round(
        startPercentage - stalePercentage - potentiallyStalePercentage,
    );

    return rating;
};
