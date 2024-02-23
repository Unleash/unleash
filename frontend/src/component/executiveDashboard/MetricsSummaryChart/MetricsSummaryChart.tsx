import { type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import { ExecutiveSummarySchema } from 'openapi';
import { LineChart } from '../LineChart/LineChart';
import { useMetricsSummary } from '../useMetricsSummary';

interface IMetricsSummaryChartProps {
    metricsSummaryTrends: ExecutiveSummarySchema['metricsSummaryTrends'];
}

export const MetricsSummaryChart: VFC<IMetricsSummaryChartProps> = ({
    metricsSummaryTrends,
}) => {
    const data = useMetricsSummary(metricsSummaryTrends, 'total');

    return <LineChart data={data} />;
};
