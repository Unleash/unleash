import type { IFeatureFlagListItem } from 'interfaces/featureToggle';
import { expired, getDiffInDays } from '../utils';
import { KILLSWITCH, PERMISSION } from 'constants/featureToggleTypes';
import { parseISO } from 'date-fns';
import type { FeatureTypeSchema } from 'openapi';

export type ReportingStatus = 'potentially-stale' | 'healthy';

export const formatStatus = (
    feature: IFeatureFlagListItem,
    featureTypes: FeatureTypeSchema[],
): ReportingStatus => {
    const { type, createdAt } = feature;

    const featureType = featureTypes.find(
        (featureType) => featureType.id === type,
    );
    const date = parseISO(createdAt);
    const now = new Date();
    const diff = getDiffInDays(date, now);

    if (
        featureType &&
        expired(diff, featureType) &&
        type !== KILLSWITCH &&
        type !== PERMISSION
    ) {
        return 'potentially-stale';
    }

    return 'healthy';
};
