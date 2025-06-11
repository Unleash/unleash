import useSWR, { mutate, type SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { InstanceInsightsSchema } from 'openapi';

export const useLifecycleInsights = (
    projects?: string[],
    options?: SWRConfiguration,
) => {
    const path = formatApiPath(
        `api/admin/insights/lifecycle?projects=${projects?.join(',')}`,
    );

    const { data, error } = useSWR<InstanceInsightsSchema>(
        path,
        fetchLifecycleInsights,
        options,
    );

    const refetchInsights = useCallback(() => {
        mutate(path).catch(console.warn);
    }, [path]);

    return {
        insights:
            data ||
            /* @ts-expect-error FIXME (lifecycleMetrics): lifecycle trends */
            ({
                userTrends: [],
                flagTrends: [],
                projectFlagTrends: [],
                metricsSummaryTrends: [],
                environmentTypeTrends: [],
            } as InstanceInsightsSchema),
        refetchInsights,
        loading: !error && !data,
        error,
    };
};

const fetchLifecycleInsights = (
    path: string,
): Promise<InstanceInsightsSchema> => {
    return fetch(path)
        .then(handleErrorResponses('Lifecycle Insights data'))
        .then((res) => res.json());
};
