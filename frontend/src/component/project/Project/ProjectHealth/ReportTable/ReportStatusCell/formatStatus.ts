import { IFeatureToggleListItem } from 'interfaces/featureToggle';
import { getDiffInDays, expired } from '../utils';
import { PERMISSION, KILLSWITCH } from 'constants/featureToggleTypes';
import { parseISO } from 'date-fns';

export type ReportingStatus = 'potentially-stale' | 'healthy';

export const formatStatus = (
    feature: IFeatureToggleListItem
): ReportingStatus => {
    const { type, createdAt } = feature;
    const date = parseISO(createdAt);
    const now = new Date();
    const diff = getDiffInDays(date, now);

    if (expired(diff, type) && type !== KILLSWITCH && type !== PERMISSION) {
        return 'potentially-stale';
    }

    return 'healthy';
};
