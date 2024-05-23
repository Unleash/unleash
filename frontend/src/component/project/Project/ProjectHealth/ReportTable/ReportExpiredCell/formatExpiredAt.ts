import type { IFeatureFlagListItem } from 'interfaces/featureToggle';
import { KILLSWITCH, PERMISSION } from 'constants/featureToggleTypes';
import { expired, getDiffInDays } from '../utils';
import { parseISO, subDays } from 'date-fns';
import type { FeatureTypeSchema } from 'openapi';

export const formatExpiredAt = (
    feature: IFeatureFlagListItem,
    featureTypes: FeatureTypeSchema[],
): string | undefined => {
    const { type, createdAt } = feature;

    const featureType = featureTypes.find(
        (featureType) => featureType.id === type,
    );

    if (
        featureType &&
        (featureType.name === KILLSWITCH || featureType.name === PERMISSION)
    ) {
        return;
    }

    const date = parseISO(createdAt);
    const now = new Date();
    const diff = getDiffInDays(date, now);

    if (featureType && expired(diff, featureType)) {
        const result = diff - (featureType?.lifetimeDays?.valueOf() || 0);
        return subDays(now, result).toISOString();
    }

    return;
};
