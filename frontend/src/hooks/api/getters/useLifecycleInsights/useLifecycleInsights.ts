import useSWR, { mutate, type SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { LifecycleTrendsSchema } from 'openapi';

const emptyLifecycleTrends: LifecycleTrendsSchema = {
    lifecycleTrends: {
        cleanup: {
            categories: {
                experimental: {
                    flagsOlderThanWeek: 0,
                    newFlagsThisWeek: 0,
                },
                permanent: {
                    flagsOlderThanWeek: 0,
                    newFlagsThisWeek: 0,
                },
                release: {
                    flagsOlderThanWeek: 0,
                    newFlagsThisWeek: 0,
                },
            },
            medianDaysHistorically: 0,
            medianDaysInCurrentStage: 0,
            totalFlags: 0,
        },
        develop: {
            categories: {
                experimental: {
                    flagsOlderThanWeek: 0,
                    newFlagsThisWeek: 0,
                },
                permanent: {
                    flagsOlderThanWeek: 0,
                    newFlagsThisWeek: 0,
                },
                release: {
                    flagsOlderThanWeek: 0,
                    newFlagsThisWeek: 0,
                },
            },
            medianDaysHistorically: 0,
            medianDaysInCurrentStage: 0,
            totalFlags: 0,
        },
        production: {
            categories: {
                experimental: {
                    flagsOlderThanWeek: 0,
                    newFlagsThisWeek: 0,
                },
                permanent: {
                    flagsOlderThanWeek: 0,
                    newFlagsThisWeek: 0,
                },
                release: {
                    flagsOlderThanWeek: 0,
                    newFlagsThisWeek: 0,
                },
            },
            medianDaysHistorically: 0,
            medianDaysInCurrentStage: 0,
            totalFlags: 0,
        },
    },
};

export const useLifecycleInsights = (
    projects?: string[],
    options?: SWRConfiguration,
) => {
    const path = formatApiPath(
        `api/admin/insights/lifecycle?projects=${projects?.join(',')}`,
    );

    const { data, error } = useSWR<LifecycleTrendsSchema>(
        path,
        fetchLifecycleInsights,
        options,
    );

    const refetchInsights = useCallback(() => {
        mutate(path).catch(console.warn);
    }, [path]);

    return {
        insights: data || emptyLifecycleTrends,
        refetchInsights,
        loading: !error && !data,
        error,
    };
};

const fetchLifecycleInsights = (
    path: string,
): Promise<LifecycleTrendsSchema> => {
    return fetch(path)
        .then(handleErrorResponses('Lifecycle Insights data'))
        .then((res) => res.json());
};
