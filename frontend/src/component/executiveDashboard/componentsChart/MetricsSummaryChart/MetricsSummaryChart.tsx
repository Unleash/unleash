import { type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import { ExecutiveSummarySchema } from 'openapi';
import { LineChart } from '../../components/LineChart/LineChart';
import { MetricsSummaryTooltip } from './MetricsChartTooltip/MetricsChartTooltip';
import { useMetricsSummary } from '../../hooks/useMetricsSummary';

interface IMetricsSummaryChartProps {
    metricsSummaryTrends: ExecutiveSummarySchema['metricsSummaryTrends'];
}

export const MetricsSummaryChart: VFC<IMetricsSummaryChartProps> = ({
    metricsSummaryTrends,
}) => {
    const data = useMetricsSummary(metricsSummaryTrends);

    return (
        <LineChart
            data={data}
            isLocalTooltip
            TooltipComponent={MetricsSummaryTooltip}
            overrideOptions={{
                parsing: { yAxisKey: 'totalRequests', xAxisKey: 'week' },
            }}
        />
    );
};
