import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import type { TrafficUsageDataSegmentedSchema } from 'openapi';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import useUiConfig from '../useUiConfig/useUiConfig';

const DEFAULT_DATA: TrafficUsageDataSegmentedSchema = {
    apiData: [],
    period: '',
};

export interface IInstanceTrafficMetricsResponse {
    usage: TrafficUsageDataSegmentedSchema;

    refetch: () => void;

    loading: boolean;

    error?: Error;
}

export const useInstanceTrafficMetrics = (
    period: string,
): IInstanceTrafficMetricsResponse => {
    const {
        isPro,
        uiConfig: { billing },
    } = useUiConfig();
    const { data, error, mutate } =
        useConditionalSWR<TrafficUsageDataSegmentedSchema>(
            isPro() || billing === 'pay-as-you-go',
            DEFAULT_DATA,
            formatApiPath(`api/admin/metrics/traffic/${period}`),
            fetcher,
        );

    return useMemo(
        () => ({
            usage: data ?? DEFAULT_DATA,
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Instance Metrics'))
        .then((res) => res.json());
};
