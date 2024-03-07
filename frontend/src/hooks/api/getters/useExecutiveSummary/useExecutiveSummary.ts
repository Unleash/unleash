import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { ExecutiveSummarySchema } from 'openapi';

interface IUseExecutiveDashboardDataOutput {
    executiveDashboardData: ExecutiveSummarySchema;
    refetchExecutiveDashboard: () => void;
    loading: boolean;
    error?: Error;
}

export const useExecutiveDashboard = (
    options?: SWRConfiguration,
): IUseExecutiveDashboardDataOutput => {
    const path = formatApiPath('api/admin/dashboard/executive');

    const { data, error } = useSWR<ExecutiveSummarySchema>(
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
): Promise<ExecutiveSummarySchema> => {
    return fetch(path)
        .then(handleErrorResponses('Executive Dashboard Data'))
        .then((res) => res.json());
};
