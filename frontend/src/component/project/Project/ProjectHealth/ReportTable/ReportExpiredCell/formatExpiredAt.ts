import { IFeatureToggleListItem } from 'interfaces/featureToggle';
import { PERMISSION, KILLSWITCH } from 'constants/featureToggleTypes';
import { getDiffInDays, expired, toggleExpiryByTypeMap } from '../utils';
import { subDays, parseISO } from 'date-fns';

export const formatExpiredAt = (
    feature: IFeatureToggleListItem
): string | undefined => {
    const { type, createdAt } = feature;

    if (type === KILLSWITCH || type === PERMISSION) {
        return;
    }

    const date = parseISO(createdAt);
    const now = new Date();
    const diff = getDiffInDays(date, now);

    if (expired(diff, type)) {
        const result = diff - toggleExpiryByTypeMap[type];
        return subDays(now, result).toISOString();
    }

    return;
};
