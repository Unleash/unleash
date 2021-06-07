import { weightTypes } from '../feature/variant/enums';
import differenceInDays from 'date-fns/differenceInDays';

const dateTimeOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
};

const dateOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
};

export const scrollToTop = () => {
    window.scrollTo(0, 0);
};

export const formatFullDateTimeWithLocale = (v, locale, tz) => {
    if (tz) {
        dateTimeOptions.timeZone = tz;
    }
    return new Date(v).toLocaleString(locale, dateTimeOptions);
};

export const formatDateWithLocale = (v, locale, tz) => {
    if (tz) {
        dateTimeOptions.timeZone = tz;
    }
    return new Date(v).toLocaleString(locale, dateOptions);
};

export const trim = value => {
    if (value && value.trim) {
        return value.trim();
    } else {
        return value;
    }
};

export function updateWeight(variants, totalWeight) {
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
        throw new Error('There must be atleast one variable variant');
    }

    const percentage = parseInt(remainingPercentage / variableVariantCount);

    return variants.map(variant => {
        if (variant.weightType !== weightTypes.FIX) {
            variant.weight = percentage;
        }
        return variant;
    });
}

export function loadNameFromHash() {
    let field = '';
    try {
        [, field] = document.location.hash.match(/name=([a-z0-9-_.]+)/i);
    } catch (e) {
        // nothing
    }
    return field;
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

export const updateIndexInArray = (array, index, newValue) =>
    array.map((v, i) => (i === index ? newValue : v));

export const showPnpsFeedback = user => {
    if (!user) return;
    if (!user.feedback) return;
    if (user.feedback.length > 0) {
        const feedback = user.feedback.find(
            feedback => feedback.feedbackId === 'pnps'
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
