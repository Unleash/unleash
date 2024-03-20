import { useMemo, type VFC } from 'react';
import 'chartjs-adapter-date-fns';

import type { ExecutiveSummarySchema } from 'openapi';
import {
    fillGradientPrimary,
    LineChart,
    NotEnoughData,
} from '../../components/LineChart/LineChart';
import { MetricsSummaryTooltip } from './MetricsChartTooltip/MetricsChartTooltip';
import { useMetricsSummary } from '../../hooks/useMetricsSummary';
import { usePlaceholderData } from 'component/executiveDashboard/hooks/usePlaceholderData';
import type { GroupedDataByProject } from '../../hooks/useGroupedProjectTrends';
import { useTheme } from '@mui/material';
import { aggregateDataPerDate } from './MetricsChartTooltip/aggregate-metrics-by-day';

interface IMetricsSummaryChartProps {
    metricsSummaryTrends: GroupedDataByProject<
        ExecutiveSummarySchema['metricsSummaryTrends']
    >;
    isAggregate?: boolean;
}

export const MetricsSummaryChart: VFC<IMetricsSummaryChartProps> = ({
    metricsSummaryTrends,
    isAggregate,
}) => {
    const theme = useTheme();
    const metricsSummary = useMetricsSummary(metricsSummaryTrends);
    const notEnoughData = useMemo(
        () => !metricsSummary.datasets.some((d) => d.data.length > 1),
        [metricsSummary],
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
            data={notEnoughData ? placeholderData : data}
            isLocalTooltip
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
            cover={notEnoughData ? <NotEnoughData /> : false}
        />
    );
};
