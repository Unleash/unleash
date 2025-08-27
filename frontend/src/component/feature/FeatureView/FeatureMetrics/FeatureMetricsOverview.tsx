import { FeatureMetrics } from './FeatureMetrics.tsx';
import { FeatureImpactMetrics } from './FeatureImpactMetrics.tsx';
import { useUiFlag } from 'hooks/useUiFlag.ts';
import { Stack } from '@mui/material';

export const FeatureMetricsOverview = () => {
    const impactMetricsEnabled = useUiFlag('impactMetrics');

    return (
        <Stack spacing={2}>
            {impactMetricsEnabled ? <FeatureImpactMetrics /> : null}
            <FeatureMetrics />
        </Stack>
    );
};
