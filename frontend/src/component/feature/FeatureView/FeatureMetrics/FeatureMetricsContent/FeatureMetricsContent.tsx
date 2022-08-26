import { FeatureMetricsTable } from '../FeatureMetricsTable/FeatureMetricsTable';
import { IFeatureMetricsRaw } from 'interfaces/featureToggle';
import { FeatureMetricsStatsRaw } from '../FeatureMetricsStats/FeatureMetricsStatsRaw';
import { Box, Typography } from '@mui/material';
import theme from 'themes/theme';
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
            <Box mt={6}>
                <Typography variant="body1" paragraph>
                    We have yet to receive any metrics for this feature toggle
                    in the selected time period.
                </Typography>
                <Typography variant="body1" paragraph>
                    Please note that, since the SDKs send metrics on an
                    interval, it might take some time before metrics appear.
                </Typography>
            </Box>
        );
    }

    return (
        <Suspense fallback={null}>
            <Box
                borderTop={1}
                pt={2}
                mt={3}
                borderColor={theme.palette.grey[200]}
            >
                <LazyFeatureMetricsChart
                    metrics={metrics}
                    hoursBack={hoursBack}
                    statsSectionId={statsSectionId}
                />
            </Box>
            <Box mt={4}>
                <FeatureMetricsStatsRaw
                    metrics={metrics}
                    hoursBack={hoursBack}
                    statsSectionId={statsSectionId}
                    tableSectionId={tableSectionId}
                />
            </Box>
            <Box mt={4}>
                <FeatureMetricsTable
                    metrics={metrics}
                    tableSectionId={tableSectionId}
                />
            </Box>
        </Suspense>
    );
};

const LazyFeatureMetricsChart = React.lazy(
    () => import('../FeatureMetricsChart/FeatureMetricsChart')
);
