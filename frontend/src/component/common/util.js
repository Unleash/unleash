import { weightTypes } from '../feature/variant/enums';

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
