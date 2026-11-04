import type { IFeatureVariantEdit } from '../FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsModal/EnvironmentVariantsModal.tsx';

export const TOTAL_WEIGHT = 1000;
const PERCENT = 10;

export const weightsFromSplitPositions = (
    splitPositions: number[], // the handle positions (e.g. 850 puts a handle 85% of the way across the bar)
): number[] => {
    const segmentStarts = [0, ...splitPositions];
    const segmentEnds = [...splitPositions, TOTAL_WEIGHT];
    return segmentStarts.map((start, index) => segmentEnds[index] - start);
};

export const absorbWeightChange = (
    weights: number[],
    changedIndex: number,
): number[] => {
    const indexesAfter = weights
        .map((_, index) => index)
        .slice(changedIndex + 1);
    const indexesBefore = weights
        .map((_, index) => index)
        .slice(0, changedIndex)
        .reverse();
    const absorberIndexes = [...indexesAfter, ...indexesBefore];

    const currentTotal = weights.reduce((sum, weight) => sum + weight, 0);
    const excess = currentTotal - TOTAL_WEIGHT;
    const nextWeights = [...weights];

    if (excess <= 0) {
        nextWeights[absorberIndexes[0]] += -excess;
        return nextWeights;
    }

    let leftToTake = excess;
    for (const index of absorberIndexes) {
        const taken = Math.min(leftToTake, nextWeights[index]);
        nextWeights[index] -= taken;
        leftToTake -= taken;
        if (leftToTake === 0) {
            break;
        }
    }
    return nextWeights;
};

const distributeWholeParts = (count: number): number[] => {
    const total = TOTAL_WEIGHT / PERCENT;
    const base = Math.floor(total / count);
    const extraPoints = total - base * count;
    return Array.from({ length: count }, (_, index) =>
        index < extraPoints ? base + 1 : base,
    );
};

export const splitWeightsEvenly = (
    variants: IFeatureVariantEdit[],
): IFeatureVariantEdit[] => {
    const shares = distributeWholeParts(variants.length);
    return variants.map((variant, index) => ({
        ...variant,
        weight: shares[index] * PERCENT,
    }));
};
