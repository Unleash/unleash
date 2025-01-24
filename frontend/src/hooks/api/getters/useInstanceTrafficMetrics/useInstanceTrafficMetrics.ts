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
          format: 'daily';
          month: string;
      }
    | {
          format: 'monthly';
          monthsBack: number;
      };

const fromSelection = (selection: ChartDataSelection) => {
    const fmt = (date: Date) => format(date, 'yyyy-MM-dd');
    if (selection.format === 'daily') {
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
    format: 'monthly' | 'daily';
    period: { from: string; to: string };
    apiData: [
        {
            apiPath: string;
            dataPoints: {
                // other options: period? time? interval? for?
                when: string; // in API: string formatted as full date or YYYY-MM, depending on monthly/daily
                trafficTypes: [
                    {
                        group: string; // we could do 'successful-requests', but that might constrain us in the future
                        count: number; // natural number
                    },
                ];
            }[];
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
    // const { from, to } = fromSelection(selection);
    // console.log('would use these from and to dates', from, to);

    const apiPath =
        selection.format === 'daily'
            ? `api/admin/metrics/traffic2?format=daily&month=${selection.month}`
            : `api/admin/metrics/traffic2?format=monthly&monthsBack=${selection.monthsBack}`;

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
