import { WeightType } from '../../../constants/variantTypes.ts';
import type { IFeatureVariantEdit } from '../FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsModal/EnvironmentVariantsModal.tsx';

export const TOTAL_WEIGHT = 1000;

export const splitPositionsFromWeights = (weights: number[]): number[] =>
    weights
        .slice(0, -1)
        .map((_, index) =>
            weights
                .slice(0, index + 1)
                .reduce((sum, weight) => sum + weight, 0),
        );

export const absorbWeightChange = ({
    weights,
    changedIndex,
    lockedIndexes = [],
}: {
    weights: number[];
    changedIndex: number;
    lockedIndexes?: number[];
}): number[] => {
    const indexesAfter = weights
        .map((_, index) => index)
        .slice(changedIndex + 1);
    const indexesBefore = weights
        .map((_, index) => index)
        .slice(0, changedIndex)
        .reverse();
    const absorberIndexes = [...indexesAfter, ...indexesBefore].filter(
        (index) => !lockedIndexes.includes(index),
    );
    if (absorberIndexes.length === 0) {
        return weights;
    }

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

const roundChangedWeights = ({
    previousWeights,
    nextWeights,
    lockedIndexes,
}: {
    previousWeights: number[];
    nextWeights: number[];
    lockedIndexes: number[];
}): number[] => {
    const changedIndexes = nextWeights
        .map((_, index) => index)
        .filter((index) => nextWeights[index] !== previousWeights[index]);
    if (changedIndexes.length === 0) {
        return nextWeights;
    }

    const lastChangedIndex = changedIndexes[changedIndexes.length - 1];
    const changedTotal = changedIndexes.reduce(
        (sum, index) => sum + nextWeights[index],
        0,
    );
    const roundedWeights = nextWeights.map((weight, index) =>
        changedIndexes.includes(index) && index !== lastChangedIndex
            ? Math.round(weight / 10) * 10
            : weight,
    );
    const roundedChangedTotal = changedIndexes
        .filter((index) => index !== lastChangedIndex)
        .reduce((sum, index) => sum + roundedWeights[index], 0);
    const lastChangedComplement = changedTotal - roundedChangedTotal;
    roundedWeights[lastChangedIndex] = Math.max(lastChangedComplement, 0);
    if (lastChangedComplement >= 0) {
        return roundedWeights;
    }
    return absorbWeightChange({
        weights: roundedWeights,
        changedIndex: lastChangedIndex,
        lockedIndexes,
    });
};

export const weightsFromDraggedHandle = ({
    previousWeights,
    splitPositions,
    draggedHandleIndex,
    lockedIndexes = [],
}: {
    previousWeights: number[];
    splitPositions: number[]; // the handle positions (e.g. 850 puts a handle 85% of the way across the bar)
    draggedHandleIndex: number;
    lockedIndexes?: number[];
}): number[] => {
    const previousPositions = splitPositionsFromWeights(previousWeights);
    const unDraggedPositions = previousPositions.filter(
        (_, index) => index !== draggedHandleIndex,
    );
    const draggedPosition =
        splitPositions.find(
            (position, index) => position !== unDraggedPositions[index],
        ) ?? previousPositions[draggedHandleIndex];

    const growingVariantIndex = draggedHandleIndex;
    const shrinkingVariantIndex = draggedHandleIndex + 1;
    const draggedDelta =
        draggedPosition - previousPositions[draggedHandleIndex];
    const appliedDelta = Math.min(
        Math.max(draggedDelta, -previousWeights[growingVariantIndex]),
        previousWeights[shrinkingVariantIndex],
    );

    const nextWeights = [...previousWeights];
    nextWeights[growingVariantIndex] += appliedDelta;
    nextWeights[shrinkingVariantIndex] -= appliedDelta;
    return roundChangedWeights({ previousWeights, nextWeights, lockedIndexes });
};

const distributeWholeParts = (total: number, count: number): number[] => {
    const base = Math.floor(total / count);
    const extraPoints = total - base * count;
    return Array.from({ length: count }, (_, index) =>
        index < extraPoints ? base + 1 : base,
    );
};

export const splitWeightsEvenly = (
    variants: IFeatureVariantEdit[],
): IFeatureVariantEdit[] => {
    const lockedVariants = variants.filter(
        (variant) => variant.weightType === WeightType.FIX,
    );
    const lockedWeight = lockedVariants.reduce(
        (sum, variant) => sum + variant.weight,
        0,
    );
    const variableCount = variants.length - lockedVariants.length;
    const shares = distributeWholeParts(
        TOTAL_WEIGHT - lockedWeight,
        variableCount,
    );
    let shareIndex = 0;
    return variants.map((variant) => {
        if (variant.weightType === WeightType.FIX) {
            return variant;
        }
        const weight = shares[shareIndex];
        shareIndex += 1;
        return { ...variant, weight };
    });
};
