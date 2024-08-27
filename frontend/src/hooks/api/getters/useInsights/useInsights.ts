import useSWR, { mutate, type SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import type { InstanceInsightsSchema } from 'openapi';

interface IUseInsightsDataOutput {
    insights: InstanceInsightsSchema;
    refetchInsights: () => void;
    loading: boolean;
    error?: Error;
}

export const useInsights = (
    from = '',
    to = '',
    options?: SWRConfiguration,
): IUseInsightsDataOutput => {
    const path = formatApiPath(`api/admin/insights?from=${from}&to=${to}`);

    const { data, error } = useSWR<InstanceInsightsSchema>(
        path,
        fetchExecutiveDashboard,
        options,
    );

    const refetchInsights = useCallback(() => {
        mutate(path).catch(console.warn);
    }, [path]);

    return {
        insights: data || {
            userTrends: [],
            flagTrends: [],
            projectFlagTrends: [],
            metricsSummaryTrends: [],
            environmentTypeTrends: [],
        },
        refetchInsights,
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
