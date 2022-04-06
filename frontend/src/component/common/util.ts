import { weightTypes } from '../feature/FeatureView/FeatureVariants/FeatureVariantsList/AddFeatureVariant/enums';
import { IFlags } from 'interfaces/uiConfig';
import { IRoute } from 'interfaces/route';
import { IFeatureVariant } from 'interfaces/featureToggle';

export const filterByFlags = (flags: IFlags) => (r: IRoute) => {
    if (!r.flag) {
        return true;
    }

    return (flags as unknown as Record<string, boolean>)[r.flag];
};

export const scrollToTop = () => {
    window.scrollTo(0, 0);
};

export const trim = (value: string): string => {
    if (value && value.trim) {
        return value.trim();
    } else {
        return value;
    }
};

export function updateWeight(variants: IFeatureVariant[], totalWeight: number) {
    if (variants.length === 0) {
        return [];
    }
    const variantMetadata = variants.reduce(
        ({ remainingPercentage, variableVariantCount }, variant) => {
            if (variant.weight && variant.weightType === weightTypes.FIX) {
                remainingPercentage -= Number(variant.weight);
            } else {
                variableVariantCount += 1;
            }
            return {
                remainingPercentage,
                variableVariantCount,
            };
        },
        { remainingPercentage: totalWeight, variableVariantCount: 0 }
    );

    const { remainingPercentage, variableVariantCount } = variantMetadata;

    if (remainingPercentage < 0) {
        throw new Error('The traffic distribution total must equal 100%');
    }

    if (!variableVariantCount) {
        throw new Error('There must be at least one variable variant');
    }

    const percentage = parseInt(
        String(remainingPercentage / variableVariantCount)
    );

    return variants.map(variant => {
        if (variant.weightType !== weightTypes.FIX) {
            variant.weight = percentage;
        }
        return variant;
    });
}

export const modalStyles = {
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        zIndex: 5,
    },
    content: {
        width: '500px',
        maxWidth: '90%',
        margin: '0',
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        transform: 'translate(-50%, -50%)',
    },
};
