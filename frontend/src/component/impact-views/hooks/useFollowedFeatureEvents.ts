import { useMemo } from 'react';
import { useEventSearch } from 'hooks/api/getters/useEventSearch/useEventSearch';
import type { MultimetricFeatureEvent } from 'component/impact-metrics/MultimetricChart/types';

const FEATURE_TYPES =
    'IS_ANY_OF:feature-environment-enabled,feature-environment-disabled';

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
        () =>
            events.map((event) => ({
                id: event.id,
                timestamp: new Date(event.createdAt).getTime(),
                type: event.type as MultimetricFeatureEvent['type'],
                label: event.label ?? event.type,
                createdBy: event.createdBy,
            })),
        [events],
    );

    return { featureEvents, loading };
};
