import { useState } from 'react';
import { useImpactMetricsApi } from 'hooks/api/actions/useImpactMetricsApi/useImpactMetricsApi';
import { useImpactMetricsOptions } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { useFeatureImpactMetrics } from 'hooks/api/getters/useFeatureImpactMetrics/useFeatureImpactMetrics';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import type { ChartConfig } from '../../impact-metrics/types';
import { useTrackFlagpageImpactMetrics } from 'component/impact-metrics/useImpactMetricsFunnel';

export const useFeatureImpactChartActions = (
    projectId: string,
    featureName: string,
) => {
    const [chartModalOpen, setChartModalOpen] = useState(false);
    const { trackMetricSaved, trackDocsClicked } =
        useTrackFlagpageImpactMetrics();

    const { createImpactMetric } = useImpactMetricsApi({
        projectId,
        featureName,
    });
    const { metricOptions, loading: metadataLoading } =
        useImpactMetricsOptions();
    const { refetch } = useFeatureImpactMetrics({
        projectId,
        featureName,
    });
    const { setToastApiError } = useToast();
    const { trackEvent } = usePlausibleTracker();

    const openChartModal = () => setChartModalOpen(true);
    const closeChartModal = () => setChartModalOpen(false);

    const saveChart = async (data: Omit<ChartConfig, 'id'>) => {
        try {
            await createImpactMetric({ ...data, feature: featureName });
            trackEvent('flagpage-impact-metrics', {
                props: { eventType: 'impact-metric-saved' },
            });
            trackMetricSaved();
            refetch();
            setChartModalOpen(false);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return {
        chartModalOpen,
        openChartModal,
        closeChartModal,
        saveChart,
        trackDocsClicked,
        metricOptions,
        metadataLoading,
    };
};
