import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import type { EventSearchResponseSchema } from 'openapi';
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
    const params = new URLSearchParams({
        feature: `IS_ANY_OF:${featureNames.join(',')}`,
        type: FEATURE_TYPES,
        environment: `IS:${environment}`,
        limit: '1000',
    });
    const path = `api/admin/search/events?${params.toString()}`;

    const { data, isLoading } = useSWR<EventSearchResponseSchema>(
        featureNames.length > 0 ? path : null,
        async () => {
            const res = await fetch(formatApiPath(path));
            if (!res.ok) {
                throw new Error(
                    `Failed to fetch feature events: ${res.status}`,
                );
            }
            return res.json();
        },
        { refreshInterval: 30_000 },
    );

    const featureEvents: MultimetricFeatureEvent[] = (data?.events ?? [])
        .map((event) => ({
            id: event.id,
            timestamp: new Date(event.createdAt).getTime(),
            type: event.type as MultimetricFeatureEvent['type'],
            label: event.label ?? event.type,
            createdBy: event.createdBy,
        }))
        .sort((left, right) => left.timestamp - right.timestamp);

    return { featureEvents, loading: isLoading };
};
