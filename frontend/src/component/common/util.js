import { weightTypes } from '../feature/FeatureView/FeatureVariants/FeatureVariantsList/AddFeatureVariant/enums';
import differenceInDays from 'date-fns/differenceInDays';

export const filterByFlags = flags => r => {
    if (r.flag && !flags[r.flag]) {
        return false;
    }
    return true;
};

export const scrollToTop = () => {
    window.scrollTo(0, 0);
};

export const trim = value => {
    if (value && value.trim) {
        return value.trim();
    } else {
        return value;
    }
};

export function updateWeight(variants, totalWeight) {
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

    const percentage = parseInt(remainingPercentage / variableVariantCount);

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

export const showPnpsFeedback = feedbackList => {
    if (!feedbackList) return;
    if (feedbackList.length > 0) {
        const feedback = feedbackList.find(
            feedback => feedback.feedbackId === PNPS_FEEDBACK_ID
        );

        if (!feedback) return false;

        if (feedback.neverShow) {
            return false;
        }

        if (feedback.given) {
            const SIX_MONTHS_IN_DAYS = 182;
            const now = new Date();
            const difference = differenceInDays(now, new Date(feedback.given));

            return difference > SIX_MONTHS_IN_DAYS;
        }
        return false;
    }
    return true;
};

export const PNPS_FEEDBACK_ID = 'pnps';
