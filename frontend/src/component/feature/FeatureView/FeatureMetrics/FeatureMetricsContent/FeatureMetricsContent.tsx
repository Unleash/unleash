import { FeatureMetricsTable } from '../FeatureMetricsTable/FeatureMetricsTable.tsx';
import type { IFeatureMetricsRaw } from 'interfaces/featureToggle';
import { FeatureMetricsStatsRaw } from '../FeatureMetricsStats/FeatureMetricsStatsRaw.tsx';
import { Box, Typography } from '@mui/material';
import { useId } from 'hooks/useId';
import React, { Suspense } from 'react';

interface IFeatureMetricsContentProps {
    metrics: IFeatureMetricsRaw[];
    hoursBack: number;
}

export const FeatureMetricsContent = ({
    metrics,
    hoursBack,
}: IFeatureMetricsContentProps) => {
    const statsSectionId = useId();
    const tableSectionId = useId();

    if (metrics.length === 0) {
        return (
            <Box
                sx={{
                    mt: 6,
                }}
            >
                <Typography
                    variant='body1'
                    sx={(theme) => ({ marginBottom: theme.spacing(2) })}
                >
                    We have yet to receive any metrics for this feature flag in
                    the selected time period.
                </Typography>
                <Typography
                    variant='body1'
                    sx={(theme) => ({ marginBottom: theme.spacing(2) })}
                >
                    Please note that, since the SDKs send metrics on an
                    interval, it might take some time before metrics appear.
                </Typography>
            </Box>
        );
    }

    return (
        <Suspense fallback={null}>
            <Box
                sx={{
                    borderTop: 1,
                    pt: 2,
                    mt: 3,
                    borderColor: 'divider',
                }}
            >
                <LazyFeatureMetricsChart
                    metrics={metrics}
                    hoursBack={hoursBack}
                    statsSectionId={statsSectionId}
                />
            </Box>
            <Box
                sx={{
                    mt: 4,
                }}
            >
                <FeatureMetricsStatsRaw
                    metrics={metrics}
                    hoursBack={hoursBack}
                    statsSectionId={statsSectionId}
                    tableSectionId={tableSectionId}
                />
            </Box>
            <Box
                sx={{
                    mt: 4,
                }}
            >
                <FeatureMetricsTable
                    metrics={metrics}
                    tableSectionId={tableSectionId}
                />
            </Box>
        </Suspense>
    );
};

const LazyFeatureMetricsChart = React.lazy(
    () => import('../FeatureMetricsChart/FeatureMetricsChart.tsx'),
);
