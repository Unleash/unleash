import type { IFeatureVariantEdit } from '../FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsModal/EnvironmentVariantsModal.tsx';

export const TOTAL_WEIGHT = 1000;

const weightsFromSplitPositions = (splitPositions: number[]): number[] => {
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

const roundChangedWeights = (
    previousWeights: number[],
    nextWeights: number[],
): number[] => {
    const changedIndexes = nextWeights
        .map((_, index) => index)
        .filter((index) => nextWeights[index] !== previousWeights[index]);
    if (changedIndexes.length === 0) {
        return nextWeights;
    }

    const roundedWeights = nextWeights.map((weight, index) =>
        changedIndexes.includes(index) ? Math.round(weight / 10) * 10 : weight,
    );
    const lastChangedIndex = changedIndexes[changedIndexes.length - 1];
    return absorbWeightChange(roundedWeights, lastChangedIndex);
};

export const weightsFromDraggedPositions = (
    previousWeights: number[],
    splitPositions: number[], // the handle positions (e.g. 850 puts a handle 85% of the way across the bar)
): number[] => {
    const nextWeights = weightsFromSplitPositions(splitPositions);
    return roundChangedWeights(previousWeights, nextWeights);
};

const distributeWholeParts = (count: number): number[] => {
    const base = Math.floor(TOTAL_WEIGHT / count);
    const extraPoints = TOTAL_WEIGHT - base * count;
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
        weight: shares[index],
    }));
};
