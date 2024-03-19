import { useMemo, type VFC } from 'react';
import 'chartjs-adapter-date-fns';

import { ExecutiveSummarySchema } from 'openapi';
import {
    fillGradientPrimary,
    LineChart,
    NotEnoughData,
} from '../../components/LineChart/LineChart';
import { MetricsSummaryTooltip } from './MetricsChartTooltip/MetricsChartTooltip';
import { useMetricsSummary } from '../../hooks/useMetricsSummary';
import { usePlaceholderData } from 'component/executiveDashboard/hooks/usePlaceholderData';
import { GroupedDataByProject } from '../../hooks/useGroupedProjectTrends';
import { useTheme } from '@mui/material';


interface IMetricsSummaryChartProps {
    metricsSummaryTrends: GroupedDataByProject<
        ExecutiveSummarySchema['metricsSummaryTrends']
    >;
    isAggregate?: boolean;
}

function aggregateDataPerDate(
    items: ExecutiveSummarySchema['metricsSummaryTrends'],
) {
    return items.reduce(
        (acc, item) => {
            if (!acc[item.date]) {
                acc[item.date] = {
                    totalApps: 0,
                    totalEnvironments: 0,
                    totalFlags: 0,
                    totalNo: 0,
                    totalRequests: 0,
                    totalYes: 0,
                };
            }

            acc[item.date].totalApps += item.totalApps;
            acc[item.date].totalEnvironments += item.totalEnvironments;
            acc[item.date].totalFlags += item.totalFlags;
            acc[item.date].totalNo += item.totalNo;
            acc[item.date].totalRequests += item.totalRequests;
            acc[item.date].totalYes += item.totalYes;

            return acc;
        },
        {} as {
            [date: string]: {
                totalApps: number;
                totalEnvironments: number;
                totalFlags: number;
                totalNo: number;
                totalRequests: number;
                totalYes: number;
            };
        },
    );
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
            key={isAggregate ? 'aggregate-metrics' : 'project-metrics'}
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
