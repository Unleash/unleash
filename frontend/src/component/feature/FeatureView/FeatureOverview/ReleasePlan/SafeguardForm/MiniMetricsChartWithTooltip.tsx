import { useImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import { useChartData } from 'component/impact-metrics/hooks/useChartData';
import { useMemo } from 'react';
import type { FC } from 'react';
import type { MetricQuerySchemaTimeRange } from 'openapi/models/metricQuerySchemaTimeRange';
import type { MetricQuerySchemaAggregationMode } from 'openapi/models/metricQuerySchemaAggregationMode';
import { MiniChartWithData } from './MiniChartWithData.tsx';
import { MiniChartNoData } from './MiniChartNoData.tsx';

interface MiniMetricsChartWithTooltipProps {
    metricName: string;
    metricDisplayName?: string;
    timeRange: MetricQuerySchemaTimeRange;
    labelSelectors: Record<string, string[]>;
    aggregationMode?: MetricQuerySchemaAggregationMode;
    threshold: number;
    projectId: string;
    featureId: string;
}

export const MiniMetricsChartWithTooltip: FC<
    MiniMetricsChartWithTooltipProps
> = ({
    metricName,
    metricDisplayName,
    timeRange,
    labelSelectors,
    aggregationMode,
    threshold,
    projectId,
    featureId,
}) => {
    const {
        data: { series: timeSeriesData },
        loading: dataLoading,
    } = useImpactMetricsData(
        metricName
            ? {
                  series: metricName,
                  range: timeRange,
                  aggregationMode,
                  labels:
                      Object.keys(labelSelectors).length > 0
                          ? labelSelectors
                          : undefined,
              }
            : undefined,
    );

    const data = useChartData({
        timeSeriesData,
        colorIndexBy: undefined,
        threshold,
    });

    const notEnoughData = useMemo(
        () =>
            !dataLoading &&
            (!timeSeriesData ||
                timeSeriesData.length === 0 ||
                !data.datasets.some((d) => d.data.length > 1)),
        [data, dataLoading, timeSeriesData],
    );

    if (notEnoughData) {
        return (
            <MiniChartNoData
                metricName={metricName}
                timeRange={timeRange}
                labelSelectors={labelSelectors}
                aggregationMode={aggregationMode}
                threshold={threshold}
            />
        );
    }

    return (
        <MiniChartWithData
            metricName={metricName}
            metricDisplayName={metricDisplayName}
            timeRange={timeRange}
            labelSelectors={labelSelectors}
            aggregationMode={aggregationMode}
            threshold={threshold}
            projectId={projectId}
            featureId={featureId}
        />
    );
};
