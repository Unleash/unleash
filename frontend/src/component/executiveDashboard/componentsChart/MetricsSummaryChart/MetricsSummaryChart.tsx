import { useMemo, type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import type { ExecutiveSummarySchema } from 'openapi';
import { LineChart, NotEnoughData } from '../../components/LineChart/LineChart';
import { MetricsSummaryTooltip } from './MetricsChartTooltip/MetricsChartTooltip';
import { useMetricsSummary } from '../../hooks/useMetricsSummary';
import { usePlaceholderData } from 'component/executiveDashboard/hooks/usePlaceholderData';
import type { GroupedDataByProject } from '../../hooks/useGroupedProjectTrends';

interface IMetricsSummaryChartProps {
    metricsSummaryTrends: GroupedDataByProject<
        ExecutiveSummarySchema['metricsSummaryTrends']
    >;
}

export const MetricsSummaryChart: VFC<IMetricsSummaryChartProps> = ({
    metricsSummaryTrends,
}) => {
    const data = useMetricsSummary(metricsSummaryTrends);
    const notEnoughData = useMemo(
        () => !data.datasets.some((d) => d.data.length > 1),
        [data],
    );
    const placeholderData = usePlaceholderData();

    return (
        <LineChart
            data={notEnoughData ? placeholderData : data}
            isLocalTooltip
            TooltipComponent={MetricsSummaryTooltip}
            overrideOptions={{
                parsing: { yAxisKey: 'totalRequests', xAxisKey: 'date' },
            }}
            cover={notEnoughData ? <NotEnoughData /> : false}
        />
    );
};
