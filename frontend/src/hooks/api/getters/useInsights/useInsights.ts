import useSWR, { mutate, type SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import type { InstanceInsightsSchema } from 'openapi';

interface IUseInsightsDataOutput {
    executiveDashboardData: InstanceInsightsSchema;
    refetchExecutiveDashboard: () => void;
    loading: boolean;
    error?: Error;
}

export const useInsights = (
    options?: SWRConfiguration,
): IUseInsightsDataOutput => {
    const path = formatApiPath('api/admin/dashboard/executive');

    const { data, error } = useSWR<InstanceInsightsSchema>(
        path,
        fetchExecutiveDashboard,
        options,
    );

    const refetchExecutiveDashboard = useCallback(() => {
        mutate(path).catch(console.warn);
    }, [path]);

    return {
        executiveDashboardData: data || {
            users: { total: 0, inactive: 0, active: 0 },
            flags: { total: 0 },
            userTrends: [],
            flagTrends: [],
            projectFlagTrends: [],
            metricsSummaryTrends: [],
            environmentTypeTrends: [],
        },
        refetchExecutiveDashboard,
        loading: !error && !data,
        error,
    };
};

const fetchExecutiveDashboard = (
    path: string,
): Promise<InstanceInsightsSchema> => {
    return fetch(path)
        .then(handleErrorResponses('Executive Dashboard Data'))
        .then((res) => res.json());
};
