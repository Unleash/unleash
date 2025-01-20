import useSWR from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import type { TrafficUsageDataSegmentedSchema } from 'openapi';

export interface IInstanceTrafficMetricsResponse {
    usage: TrafficUsageDataSegmentedSchema;

    refetch: () => void;

    loading: boolean;

    error?: Error;
}

export const useInstanceTrafficMetrics = (
    period: string,
): IInstanceTrafficMetricsResponse => {
    const { data, error, mutate } = useSWR(
        formatApiPath(`api/admin/metrics/traffic/${period}`),
        fetcher,
    );

    return useMemo(
        () => ({
            usage: useInstanceTrafficMetricsMonths2(4),
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

export const useInstanceTrafficMetricsMonths2 = (_monthsBack: number) => {
    const mockMonthData = [
        {
            apiPath: '/api/admin',
            months: [
                {
                    month: '2025-01',
                    trafficTypes: [
                        {
                            group: 'successful-requests',
                            count: 535,
                        },
                    ],
                },
                {
                    month: '2024-12',
                    trafficTypes: [
                        {
                            group: 'successful-requests',
                            count: 240,
                        },
                    ],
                },
                {
                    month: '2024-11',
                    trafficTypes: [
                        {
                            group: 'successful-requests',
                            count: 180, // Example count
                        },
                    ],
                },
                {
                    month: '2024-10',
                    trafficTypes: [
                        {
                            group: 'successful-requests',
                            count: 200, // Example count
                        },
                    ],
                },
            ],
        },
        {
            apiPath: '/edge',
            months: [
                {
                    month: '2025-01',
                    trafficTypes: [
                        {
                            group: 'successful-requests',
                            count: 535,
                        },
                    ],
                },
                {
                    month: '2024-12',
                    trafficTypes: [
                        {
                            group: 'successful-requests',
                            count: 240,
                        },
                    ],
                },
                {
                    month: '2024-11',
                    trafficTypes: [
                        {
                            group: 'successful-requests',
                            count: 180, // Example count
                        },
                    ],
                },
                {
                    month: '2024-10',
                    trafficTypes: [
                        {
                            group: 'successful-requests',
                            count: 200, // Example count
                        },
                    ],
                },
            ],
        },
        {
            apiPath: '/api/frontend',
            months: [
                {
                    month: '2025-01',
                    trafficTypes: [
                        {
                            group: 'successful-requests',
                            count: 535,
                        },
                    ],
                },
                {
                    month: '2024-12',
                    trafficTypes: [
                        {
                            group: 'successful-requests',
                            count: 240,
                        },
                    ],
                },
                {
                    month: '2024-11',
                    trafficTypes: [
                        {
                            group: 'successful-requests',
                            count: 180, // Example count
                        },
                    ],
                },
                {
                    month: '2024-10',
                    trafficTypes: [
                        {
                            group: 'successful-requests',
                            count: 200, // Example count
                        },
                    ],
                },
            ],
        },
        {
            apiPath: '/api/client',
            months: [
                {
                    month: '2025-01',
                    trafficTypes: [
                        {
                            group: 'successful-requests',
                            count: 535,
                        },
                    ],
                },
                {
                    month: '2024-12',
                    trafficTypes: [
                        {
                            group: 'successful-requests',
                            count: 240,
                        },
                    ],
                },
                {
                    month: '2024-11',
                    trafficTypes: [
                        {
                            group: 'successful-requests',
                            count: 180, // Example count
                        },
                    ],
                },
                {
                    month: '2024-10',
                    trafficTypes: [
                        {
                            group: 'successful-requests',
                            count: 200, // Example count
                        },
                    ],
                },
            ],
        },
    ];
    return mockMonthData;
};
