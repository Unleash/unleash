import { Link, Route, Routes } from 'react-router';
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
import { ImpactMetricModal } from '../../impact-metrics/ImpactMetricModal/ImpactMetricModal';
import { useFeatureImpactChartActions } from './useFeatureImpactChartActions';
import { useImpactMetricsEnabled } from 'component/impact-metrics/hooks/useImpactMetricsEnabled.ts';

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
    const impactMetricsEnabled = useImpactMetricsEnabled();
    const showImpactMetrics = impactMetricsFlagPage && impactMetricsEnabled;

    const { feature, loading, error, status } = useFeature(
        projectId,
        featureId,
        { refreshInterval: 15 * 1000 },
    );

    const {
        chartModalOpen,
        openChartModal,
        closeChartModal,
        saveChart,
        metricOptions,
        metadataLoading,
    } = useFeatureImpactChartActions(projectId, featureId);

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
                                showImpactMetrics ? (
                                    <FeatureImpactHeader
                                        projectId={projectId}
                                        featureName={featureId}
                                        onAddChart={openChartModal}
                                    />
                                ) : undefined
                            }
                        />
                    }
                />
            </Routes>
            {showImpactMetrics && (
                <ImpactMetricModal
                    open={chartModalOpen}
                    onClose={closeChartModal}
                    onSave={saveChart}
                    metrics={metricOptions}
                    loading={metadataLoading}
                />
            )}
        </div>
    );
};
