import { type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import { ExecutiveSummarySchema } from 'openapi';
import { LineChart } from '../LineChart/LineChart';
import { useMetricsSummary } from '../useMetricsSummary';

interface IImpressionsSummaryChartProps {
    metricsSummary: ExecutiveSummarySchema['impressionsSummary'];
}

export const MetricsSummaryChart: VFC<IImpressionsSummaryChartProps> = ({
    metricsSummary,
}) => {
    const data = useMetricsSummary(metricsSummary, 'total');

    return <LineChart data={data} />;
};
