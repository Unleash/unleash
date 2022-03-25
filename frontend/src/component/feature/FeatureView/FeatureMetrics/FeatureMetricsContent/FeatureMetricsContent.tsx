import { FeatureMetricsTable } from '../FeatureMetricsTable/FeatureMetricsTable';
import { IFeatureMetricsRaw } from '../../../../../interfaces/featureToggle';
import { FeatureMetricsStatsRaw } from '../FeatureMetricsStats/FeatureMetricsStatsRaw';
import { FeatureMetricsChart } from '../FeatureMetricsChart/FeatureMetricsChart';
import { FeatureMetricsEmpty } from '../FeatureMetricsEmpty/FeatureMetricsEmpty';
import { Box } from '@material-ui/core';
import theme from 'themes/mainTheme';

interface IFeatureMetricsContentProps {
    metrics: IFeatureMetricsRaw[];
    hoursBack: number;
}

export const FeatureMetricsContent = ({
    metrics,
    hoursBack,
}: IFeatureMetricsContentProps) => {
    if (metrics.length === 0) {
        return (
            <Box mt={6}>
                <FeatureMetricsEmpty />
            </Box>
        );
    }

    return (
        <>
            <Box
                borderTop={1}
                pt={2}
                mt={3}
                borderColor={theme.palette.grey[200]}
            >
                <FeatureMetricsChart metrics={metrics} hoursBack={hoursBack} />
            </Box>
            <Box mt={4}>
                <FeatureMetricsStatsRaw
                    metrics={metrics}
                    hoursBack={hoursBack}
                />
            </Box>
            <Box mt={4}>
                <FeatureMetricsTable metrics={metrics} />
            </Box>
        </>
    );
};
