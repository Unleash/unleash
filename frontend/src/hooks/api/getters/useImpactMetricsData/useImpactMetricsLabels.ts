import type { MetricSource } from 'component/impact-metrics/types';
import { useImpactMetricsData } from './useImpactMetricsData.js';

// Labels only depend on metric and source: the backend always discovers them
// from a month-wide window
export const useImpactMetricsLabels = (
    metricName: string,
    source?: MetricSource,
) => {
    const { data, loading, error } = useImpactMetricsData(
        metricName
            ? {
                  metricName,
                  range: 'hour',
                  source,
                  mode: 'edit',
              }
            : undefined,
        // Label sets change on deploys so no need to refresh
        { refreshInterval: 0 },
    );

    return { labels: data.labels, loading, error };
};
