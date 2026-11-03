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
