import { useMemo, type VFC } from 'react';
import 'chartjs-adapter-date-fns';

import type { InstanceInsightsSchema } from 'openapi';
import {
    fillGradientPrimary,
    LineChart,
    NotEnoughData,
} from 'component/insights/components/LineChart/LineChart';
import { MetricsSummaryTooltip } from './MetricsChartTooltip/MetricsChartTooltip';
import { useMetricsSummary } from 'component/insights/hooks/useMetricsSummary';
import { usePlaceholderData } from 'component/insights/hooks/usePlaceholderData';
import type { GroupedDataByProject } from 'component/insights/hooks/useGroupedProjectTrends';
import { useTheme } from '@mui/material';
import { aggregateDataPerDate } from './MetricsChartTooltip/aggregate-metrics-by-day';

interface IMetricsSummaryChartProps {
    metricsSummaryTrends: GroupedDataByProject<
        InstanceInsightsSchema['metricsSummaryTrends']
    >;
    isAggregate?: boolean;
    isLoading?: boolean;
}

export const MetricsSummaryChart: VFC<IMetricsSummaryChartProps> = ({
    metricsSummaryTrends,
    isAggregate,
    isLoading,
}) => {
    const theme = useTheme();
    const metricsSummary = useMetricsSummary(metricsSummaryTrends);
    const notEnoughData = useMemo(
        () =>
            !isLoading &&
            !metricsSummary.datasets.some((d) => d.data.length > 1),
        [metricsSummary, isLoading],
    );
    const placeholderData = usePlaceholderData();

    const aggregatedPerDay = useMemo(() => {
        const result = aggregateDataPerDate(
            Object.values(metricsSummary.datasets).flatMap((item) => item.data),
        );
        const data = Object.entries(result)
            .map(([date, trends]) => ({ date, ...trends }))
            .sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime(),
            );

        return {
            datasets: [
                {
                    label: 'Total Requests',
                    data: data,
                    borderColor: theme.palette.primary.light,
                    backgroundColor: fillGradientPrimary,
                    fill: true,
                    order: 3,
                },
            ],
        };
    }, [JSON.stringify(metricsSummaryTrends), theme]);

    const data = isAggregate ? aggregatedPerDay : metricsSummary;

    return (
        <LineChart
            data={notEnoughData || isLoading ? placeholderData : data}
            TooltipComponent={MetricsSummaryTooltip}
            overrideOptions={
                notEnoughData
                    ? {}
                    : {
                          parsing: {
                              yAxisKey: 'totalRequests',
                              xAxisKey: 'date',
                          },
                      }
            }
            cover={notEnoughData ? <NotEnoughData /> : isLoading}
        />
    );
};
