import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import type { MultimetricFeatureEvent } from 'component/impact-metrics/MultimetricChart/types';
import type { EventSearchResponseSchema } from 'openapi';

const ENABLED_DISABLED_TYPES =
    'IS_ANY_OF:feature-environment-enabled,feature-environment-disabled';

const DEFAULT_ENVIRONMENT = 'production';

type UseFeatureEnvironmentEventsOptions = {
    featureName: string;
    project: string;
    environment?: string;
};

export const useFeatureEnvironmentEvents = ({
    featureName,
    project,
    environment = DEFAULT_ENVIRONMENT,
}: UseFeatureEnvironmentEventsOptions): {
    featureEvents: MultimetricFeatureEvent[];
    loading: boolean;
} => {
    const params = new URLSearchParams({
        feature: `IS:${featureName}`,
        project: `IS:${project}`,
        type: ENABLED_DISABLED_TYPES,
        environment: `IS:${environment}`,
        limit: '100',
    });

    const path = `api/admin/search/events?${params.toString()}`;

    const { data, isLoading } = useSWR<EventSearchResponseSchema>(
        path,
        async () => {
            const res = await fetch(formatApiPath(path));
            if (!res.ok) {
                throw new Error(
                    `Failed to fetch feature events: ${res.status}`,
                );
            }
            return res.json();
        },
        {
            refreshInterval: 30_000,
            revalidateOnFocus: true,
        },
    );

    const featureEvents: MultimetricFeatureEvent[] = (data?.events ?? []).map(
        (event) => ({
            id: event.id,
            timestamp: new Date(event.createdAt).getTime(),
            type: event.type as MultimetricFeatureEvent['type'],
            label: event.label ?? event.type,
            createdBy: event.createdBy,
        }),
    );

    return { featureEvents, loading: isLoading };
};
