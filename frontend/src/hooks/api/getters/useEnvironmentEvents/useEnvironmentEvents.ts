import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import type { MultimetricFeatureEvent } from 'component/impact-metrics/MultimetricChart/types';
import type { EventSearchResponseSchema } from 'openapi';

const ENABLED_DISABLED_TYPES =
    'IS_ANY_OF:feature-environment-enabled,feature-environment-disabled';

const DEFAULT_LIMIT = 500;

type UseEnvironmentEventsOptions = {
    environment: string;
    from?: string; // YYYY-MM-DD
    to?: string; // YYYY-MM-DD
    limit?: number;
    enabled?: boolean;
};

export const useEnvironmentEvents = ({
    environment,
    from,
    to,
    limit = DEFAULT_LIMIT,
    enabled = true,
}: UseEnvironmentEventsOptions): {
    featureEvents: MultimetricFeatureEvent[];
    loading: boolean;
} => {
    const params = new URLSearchParams({
        type: ENABLED_DISABLED_TYPES,
        environment: `IS:${environment}`,
        limit: String(limit),
    });
    if (from) params.set('from', `IS:${from}`);
    if (to) params.set('to', `IS:${to}`);

    const path = `api/admin/search/events?${params.toString()}`;

    const { data, isLoading } = useSWR<EventSearchResponseSchema>(
        enabled ? path : null,
        async () => {
            const res = await fetch(formatApiPath(path));
            if (!res.ok) {
                throw new Error(
                    `Failed to fetch environment events: ${res.status}`,
                );
            }
            return res.json();
        },
        {
            refreshInterval: 30_000,
            revalidateOnFocus: true,
        },
    );

    const featureEvents: MultimetricFeatureEvent[] = (data?.events ?? [])
        .filter((event) => Boolean(event.featureName))
        .map((event) => ({
            id: event.id,
            timestamp: new Date(event.createdAt).getTime(),
            type: event.type as MultimetricFeatureEvent['type'],
            label: event.label ?? event.type,
            createdBy: event.createdBy,
            featureName: event.featureName ?? undefined,
        }));

    return { featureEvents, loading: isLoading };
};
