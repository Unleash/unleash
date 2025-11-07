import useSWR, { mutate, type SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import {
    eachWeekOfInterval,
    format,
    lastDayOfWeek,
    parseISO,
    startOfDay,
} from 'date-fns';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type {
    InstanceInsightsSchema,
    GetInstanceInsightsParams,
} from 'openapi';

type InstanceInsightsWithLabels = InstanceInsightsSchema & {
    labels: { date: string; week: string }[];
};

const generateWeekLabels = (
    start: string,
    end: string,
): { week: string; date: string }[] =>
    eachWeekOfInterval(
        { start: parseISO(start), end: parseISO(end) },
        {
            weekStartsOn: 1,
        },
    ).map((date) => ({
        week: format(date, 'RRRR-II'),
        date: startOfDay(
            lastDayOfWeek(date, { weekStartsOn: 1 }),
        ).toISOString(),
    }));

export const useInsights = (
    from: GetInstanceInsightsParams['from'] = '',
    to: GetInstanceInsightsParams['to'] = '',
    options?: SWRConfiguration,
) => {
    const path = formatApiPath(`api/admin/insights?from=${from}&to=${to}`);

    const { data, error } = useSWR<InstanceInsightsSchema>(
        path,
        fetchExecutiveDashboard,
        options,
    );

    const refetchInsights = useCallback(() => {
        mutate(path).catch(console.warn);
    }, [path]);

    const labels = generateWeekLabels(from, to);
    const insights: InstanceInsightsWithLabels = data
        ? { ...data, labels }
        : {
              labels,
              userTrends: [],
              flagTrends: [],
              projectFlagTrends: [],
              metricsSummaryTrends: [],
              environmentTypeTrends: [],
              lifecycleTrends: [],
              creationArchiveTrends: [],
          };

    return {
        insights,
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
