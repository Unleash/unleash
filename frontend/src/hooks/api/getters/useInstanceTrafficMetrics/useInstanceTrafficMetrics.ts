import useSWR from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import type { TrafficUsageDataSegmentedSchema } from 'openapi';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';

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
            usage: data,
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

export type ChartDataSelection =
    | {
          grouping: 'daily';
          month: string;
      }
    | {
          grouping: 'monthly';
          monthsBack: number;
      };

const fromSelection = (selection: ChartDataSelection) => {
    const fmt = (date: Date) => format(date, 'yyyy-MM-dd');
    if (selection.grouping === 'daily') {
        const month = new Date(selection.month);
        const from = fmt(month);
        const to = fmt(endOfMonth(month));
        return { from, to };
    } else {
        const now = new Date();
        const from = fmt(startOfMonth(subMonths(now, selection.monthsBack)));
        const to = fmt(endOfMonth(now));
        return { from, to };
    }
};

export type SegmentedSchema = {
    grouping: 'monthly' | 'daily';
    dateRange: { from: string; to: string };
    apiData: [
        {
            apiPath: string;
            dataPoints: Array<{
                // other options: period? time? interval? for?
                period: string; // in API: string formatted as full date or YYYY-MM, depending on monthly/daily
                trafficTypes: Array<{
                    group: string; // we could do 'successful-requests', but that might constrain us in the future
                    count: number; // natural number
                }>;
            }>;
        },
    ];
};

export type SegmentedSchemaApiData = SegmentedSchema['apiData'][number];

export type InstanceTrafficMetricsResponse2 = {
    usage: SegmentedSchema;

    refetch: () => void;

    loading: boolean;

    error?: Error;
};

export const useInstanceTrafficMetrics2 = (
    selection: ChartDataSelection,
): InstanceTrafficMetricsResponse2 => {
    const { from, to } = fromSelection(selection);

    const apiPath = `api/admin/metrics/traffic-search?grouping=${selection.grouping}&from=${from}&to=${to}`;

    const { data, error, mutate } = useSWR(formatApiPath(apiPath), fetcher);

    return useMemo(
        () => ({
            usage: data,
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
