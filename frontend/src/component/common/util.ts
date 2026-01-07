import { weightTypes } from 'constants/weightTypes';
import type { IUiConfig } from 'interfaces/uiConfig';
import type { INavigationMenuItem } from 'interfaces/route';
import type { IFeatureVariant } from 'interfaces/featureToggle';
import { format, isValid, parseISO } from 'date-fns';
import type { IFeatureVariantEdit } from 'component/feature/FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsModal/EnvironmentVariantsModal';
import { formatDateYMD } from '../../utils/formatDate.js';

/**
 * Handle feature flags and configuration for different plans.
 */
export const filterByConfig =
    (config: IUiConfig) => (r: INavigationMenuItem) => {
        const flags = config.flags as unknown as Record<string, boolean>;

        if (r.notFlag && flags[r.notFlag] === true) {
            return false;
        }

        if (r.flag) {
            // Check if the route's `flag` is enabled in IUiConfig.flags.
            return Boolean(flags[r.flag]);
        }

        if (r.configFlag) {
            // Check if the route's `configFlag` is enabled in IUiConfig.
            return Boolean(config[r.configFlag]);
        }

        const isOss = !config?.versionInfo?.current?.enterprise;
        if (isOss && r.enterprise) {
            return false;
        }

        return true;
    };

export const scrollToTop = () => {
    window.scrollTo(0, 0);
};

export const normalizeRoutePath = (
    route: INavigationMenuItem,
): INavigationMenuItem => ({
    ...route,
    path: route.path.replace('/*', ''),
});

export const trim = (value: string): string => {
    if (value?.trim) {
        return value.trim();
    } else {
        return value;
    }
};

export const getLocalizedDateString = (
    value: Date | string | null | undefined,
    locale: string,
) => {
    const date = value
        ? value instanceof Date
            ? formatDateYMD(value, locale)
            : formatDateYMD(parseISO(value), locale)
        : undefined;
    return date;
};

export const parseDateValue = (value: string) => {
    const date = new Date(value);
    return `${format(date, 'yyyy-MM-dd')}T${format(date, 'HH:mm')}`;
};

export const parseValidDate = (value: string): Date | undefined => {
    const parsed = new Date(value);

    if (isValid(parsed)) {
        return parsed;
    }
};

export const calculateVariantWeight = (weight: number) => {
    return weight / 10.0;
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
        { remainingPercentage: totalWeight, variableVariantCount: 0 },
    );

    const { remainingPercentage, variableVariantCount } = variantMetadata;

    if (remainingPercentage < 0) {
        throw new Error('The traffic distribution total must equal 100%');
    }

    if (!variableVariantCount) {
        throw new Error('There must be at least one variable variant');
    }

    const percentage = Number.parseInt(
        String(remainingPercentage / variableVariantCount),
        10,
    );

    return variants.map((variant) => {
        if (variant.weightType !== weightTypes.FIX) {
            variant.weight = percentage;
        }
        return variant;
    });
}

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
