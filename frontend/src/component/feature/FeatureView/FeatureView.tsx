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
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { FeatureImpactHeader } from './FeatureImpactOverview/FeatureImpactHeader';
import { ChartConfigModal } from '../../impact-metrics/ChartConfigModal/ChartConfigModal';
import { useFeatureImpactChartActions } from './useFeatureImpactChartActions';

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
    const { isEnterprise } = useUiConfig();
    const showImpactMetrics = impactMetricsFlagPage && isEnterprise();

    const { feature, loading, error, status } = useFeature(
        projectId,
        featureId,
    );

    const {
        chartModalOpen,
        openChartModal,
        closeChartModal,
        saveChart,
        trackDocsClicked,
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
                <ChartConfigModal
                    open={chartModalOpen}
                    onClose={closeChartModal}
                    onSave={saveChart}
                    onDocsClicked={trackDocsClicked}
                    metricSeries={metricOptions}
                    loading={metadataLoading}
                />
            )}
        </div>
    );
};
