import type { FC } from 'react';
import type { ImpactMetricsConfigSchema } from 'openapi';
import type { ChartTimeRange } from 'component/impact-metrics/MultimetricChart/chartConfig';
import { useGroupedImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useGroupedImpactMetricsData';
import { useFeatureEnvironmentEvents } from 'hooks/api/getters/useFeatureEnvironmentEvents/useFeatureEnvironmentEvents';
import { MultimetricChartCard } from './MultimetricChartCard';

interface CollapsedMetricGroupCardProps {
    configs: ImpactMetricsConfigSchema[];
    projectId: string;
    featureName: string;
}

export const CollapsedMetricGroupCard: FC<CollapsedMetricGroupCardProps> = ({
    configs,
    projectId,
    featureName,
}) => {
    const { stepSeries, stepTotals, start, end, loading } =
        useGroupedImpactMetricsData(configs);
    const { featureEvents } = useFeatureEnvironmentEvents({
        featureName,
        project: projectId,
    });

    const firstLabel =
        configs[0].title || configs[0].displayName || configs[0].metricName;
    const extra = configs.length - 1;
    const title = extra > 0 ? `${firstLabel} +${extra} more` : firstLabel;

    const timeRange = configs[0].timeRange as ChartTimeRange;

    return (
        <MultimetricChartCard
            title={title}
            timeRange={timeRange}
            stepCount={configs.length}
            stepSeries={stepSeries}
            stepTotals={stepTotals}
            featureEvents={featureEvents}
            start={start}
            end={end}
            loading={loading}
            href={`/projects/${projectId}/features/${featureName}/metrics`}
        />
    );
};
