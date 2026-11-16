import { weightTypes } from 'constants/weightTypes';
import type { IFeatureVariantEdit } from 'component/feature/variantEdit';

export function updateWeightEdit(
    variants: IFeatureVariantEdit[],
    totalWeight: number,
) {
    if (variants.length === 0) {
        return [];
    }
    let { remainingPercentage, variableVariantCount } = variants.reduce(
        ({ remainingPercentage, variableVariantCount }, variant) => {
            if (variant.weight && variant.weightType === weightTypes.FIX) {
                remainingPercentage -= Number(variant.weight);
            }
            if (variant.weightType === weightTypes.VARIABLE) {
                variableVariantCount += 1;
            }
            return {
                remainingPercentage,
                variableVariantCount,
            };
        },
        { remainingPercentage: totalWeight, variableVariantCount: 0 },
    );

    const getPercentage = () =>
        Math.max(Math.round(remainingPercentage / variableVariantCount), 0);

    return variants.map((variant) => {
        if (variant.weightType !== weightTypes.FIX) {
            const percentage = getPercentage(); // round "as we go" - clean best effort approach
            remainingPercentage -= percentage;
            variableVariantCount -= 1;

            variant.weight = percentage;
        }

        return variant;
    });
}
