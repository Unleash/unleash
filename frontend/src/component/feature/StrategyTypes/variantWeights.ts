import { WeightType } from '../../../constants/variantTypes.ts';
import type { IFeatureVariantEdit } from '../FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsModal/EnvironmentVariantsModal.tsx';

export const TOTAL_WEIGHT = 1000;

export const SLIDER_STEP = 10; // one whole percent

export const FIXED_WEIGHT_EXPLANATION =
    "This weight was set manually, so it's not automatically redistributed.";

export const splitPositionsFromWeights = (weights: number[]): number[] => {
    const positions: number[] = [];
    let runningTotal = 0;
    for (const weight of weights.slice(0, -1)) {
        runningTotal += weight;
        positions.push(runningTotal);
    }
    return positions;
};

export const absorbWeightChange = ({
    weights,
    changedIndex,
    fixedIndices = [],
}: {
    weights: number[];
    changedIndex: number;
    fixedIndices?: number[];
}): number[] => {
    const allIndices = weights.map((_, index) => index);
    const indicesAfter = allIndices.slice(changedIndex + 1);
    const indicesBefore = allIndices.slice(0, changedIndex).reverse();
    const absorberIndices = [...indicesAfter, ...indicesBefore].filter(
        (index) => !fixedIndices.includes(index),
    );
    if (absorberIndices.length === 0) {
        return weights;
    }

    const currentTotal = weights.reduce((sum, weight) => sum + weight, 0);
    const excess = currentTotal - TOTAL_WEIGHT;
    const nextWeights = [...weights];

    if (excess <= 0) {
        nextWeights[absorberIndices[0]] += -excess;
        return nextWeights;
    }

    let leftToTake = excess;
    for (const index of absorberIndices) {
        const taken = Math.min(leftToTake, nextWeights[index]);
        nextWeights[index] -= taken;
        leftToTake -= taken;
        if (leftToTake === 0) {
            break;
        }
    }
    return nextWeights;
};

export const weightsAfterHandleDrag = ({
    previousWeights,
    targetPosition,
    draggedHandleIndex,
}: {
    previousWeights: number[];
    targetPosition: number; // where the handle should land (e.g. 850 puts it 85% of the way across the bar)
    draggedHandleIndex: number;
}): number[] => {
    const previousPositions = splitPositionsFromWeights(previousWeights);
    if (targetPosition === previousPositions[draggedHandleIndex]) {
        return previousWeights;
    }

    const leftVariantIndex = draggedHandleIndex;
    const rightVariantIndex = draggedHandleIndex + 1;
    const pairTotal =
        previousWeights[leftVariantIndex] + previousWeights[rightVariantIndex];
    const pairStart =
        previousPositions[draggedHandleIndex] -
        previousWeights[leftVariantIndex];

    const exactLeftWeight = Math.min(
        Math.max(targetPosition - pairStart, 0),
        pairTotal,
    );
    const draggedToPairEnd = exactLeftWeight === pairTotal;
    const leftWeight = draggedToPairEnd
        ? pairTotal // rounding to whole percents strands the remainder of an uneven pair total in the right variant, making 0 unreachable
        : Math.min(
              Math.round(exactLeftWeight / SLIDER_STEP) * SLIDER_STEP,
              pairTotal,
          );

    const nextWeights = [...previousWeights];
    nextWeights[leftVariantIndex] = leftWeight;
    nextWeights[rightVariantIndex] = pairTotal - leftWeight;
    return nextWeights;
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
    const fixedVariants = variants.filter(
        (variant) => variant.weightType === WeightType.FIX,
    );
    const fixedWeight = fixedVariants.reduce(
        (sum, variant) => sum + variant.weight,
        0,
    );
    const variableCount = variants.length - fixedVariants.length;
    const shares = distributeWholeParts(
        TOTAL_WEIGHT - fixedWeight,
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
