import { useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import FeatureLog from './FeatureLog/FeatureLog.tsx';
import { FeatureOverview } from './FeatureOverview/FeatureOverview.tsx';
import { FeatureEnvironmentVariants } from './FeatureVariants/FeatureEnvironmentVariants/FeatureEnvironmentVariants.tsx';
import { FeatureSettings } from './FeatureSettings/FeatureSettings.tsx';
import useLoading from 'hooks/useLoading';
import { FeatureNotFound } from 'component/feature/FeatureView/FeatureNotFound/FeatureNotFound';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { FeatureViewHeader } from './FeatureViewHeader.tsx';
import { styled } from '@mui/material';
import { FeatureMetricsOverview } from './FeatureMetrics/FeatureMetricsOverview.tsx';
import { useUiFlag } from 'hooks/useUiFlag';
import { FeatureImpactHeader } from './FeatureImpactOverview/FeatureImpactHeader';
import { ChartConfigModal } from '../../impact-metrics/ChartConfigModal/ChartConfigModal';
import { useImpactMetricsApi } from 'hooks/api/actions/useImpactMetricsApi/useImpactMetricsApi';
import { useImpactMetricsOptions } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { useFeatureImpactMetrics } from 'hooks/api/getters/useFeatureImpactMetrics/useFeatureImpactMetrics';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import type { ChartConfig } from '../../impact-metrics/types';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

export const StyledLink = styled(Link)(() => ({
    maxWidth: '100%',
    textDecoration: 'none',
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
}));

export const FeatureView = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');

    const impactMetricsFlagPage = useUiFlag('impactMetricsFlagPage');
    const [chartModalOpen, setChartModalOpen] = useState(false);

    const { feature, loading, error, status } = useFeature(
        projectId,
        featureId,
    );

    const { createImpactMetric } = useImpactMetricsApi({
        projectId,
        featureName: featureId,
    });
    const { metricOptions, loading: metadataLoading } =
        useImpactMetricsOptions();
    const { refetch } = useFeatureImpactMetrics({
        projectId,
        featureName: featureId,
    });
    const { setToastApiError } = useToast();
    const { trackEvent } = usePlausibleTracker();

    const handleSaveChart = async (data: Omit<ChartConfig, 'id'>) => {
        try {
            await createImpactMetric({ ...data, feature: featureId });
            trackEvent('flagpage-impact-metrics', {
                props: { eventType: 'impact-metric-saved' },
            });
            refetch();
            setChartModalOpen(false);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const ref = useLoading(loading);

    if (status === 404) {
        return <FeatureNotFound />;
    }

    if (error !== undefined) {
        return <div ref={ref} />;
    }

    return (
        <div ref={ref}>
            <FeatureViewHeader feature={feature} />
            <Routes>
                <Route path='metrics' element={<FeatureMetricsOverview />} />
                <Route path='logs' element={<FeatureLog />} />
                <Route
                    path='variants'
                    element={<FeatureEnvironmentVariants />}
                />
                <Route path='settings' element={<FeatureSettings />} />
                <Route
                    path='*'
                    element={
                        <FeatureOverview
                            header={
                                impactMetricsFlagPage ? (
                                    <FeatureImpactHeader
                                        projectId={projectId}
                                        featureName={featureId}
                                        onAddChart={() =>
                                            setChartModalOpen(true)
                                        }
                                    />
                                ) : undefined
                            }
                        />
                    }
                />
            </Routes>
            {impactMetricsFlagPage && (
                <ChartConfigModal
                    open={chartModalOpen}
                    onClose={() => setChartModalOpen(false)}
                    onSave={handleSaveChart}
                    metricSeries={metricOptions}
                    loading={metadataLoading}
                />
            )}
        </div>
    );
};
