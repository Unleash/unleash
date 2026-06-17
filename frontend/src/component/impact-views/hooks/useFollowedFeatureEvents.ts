import { useMemo } from 'react';
import { useEventSearch } from 'hooks/api/getters/useEventSearch/useEventSearch';
import type { MultimetricFeatureEvent } from 'component/impact-metrics/MultimetricChart/types';
import { FEATURE_TYPES, mapFeatureEvents } from './mapFeatureEvents';

export type UseFollowedFeatureEvents = {
    featureEvents: MultimetricFeatureEvent[];
    loading: boolean;
};

export const useFollowedFeatureEvents = (
    featureNames: string[],
    environment: string,
): UseFollowedFeatureEvents => {
    const { events, loading } = useEventSearch(
        {
            feature: `IS_ANY_OF:${featureNames.join(',')}`,
            type: FEATURE_TYPES,
            environment: `IS:${environment}`,
            limit: '1000',
        },
        { refreshInterval: 30_000 },
    );

    const featureEvents = useMemo<MultimetricFeatureEvent[]>(
        () => mapFeatureEvents(events, environment),
        [events, environment],
    );

    return { featureEvents, loading };
};
