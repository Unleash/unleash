import { FeatureExposureMetrics } from './FeatureExposureMetrics.tsx';
import { FeatureImpactMetrics } from './FeatureImpactMetrics.tsx';
import { useImpactMetricsEnabled } from 'component/impact-metrics/hooks/useImpactMetricsEnabled.ts';
import { Stack } from '@mui/material';

export const FeatureMetricsOverview = () => {
    const impactMetricsEnabled = useImpactMetricsEnabled();

    return (
        <Stack spacing={2}>
            {impactMetricsEnabled ? <FeatureImpactMetrics /> : null}
            <FeatureExposureMetrics />
        </Stack>
    );
};
