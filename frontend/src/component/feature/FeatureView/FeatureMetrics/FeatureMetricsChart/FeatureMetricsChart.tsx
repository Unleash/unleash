import type { IFeatureMetricsRaw } from 'interfaces/featureToggle';
import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    TimeScale,
    Title,
    Tooltip,
} from 'chart.js';
import { useLocationSettings } from 'hooks/useLocationSettings';
import 'chartjs-adapter-date-fns';
import { createChartData } from './createChartData.ts';
import { createChartOptions } from './createChartOptions.tsx';
import { useTheme } from '@mui/material';

interface IFeatureMetricsChartProps {
    metrics: IFeatureMetricsRaw[];
    hoursBack: number;
    statsSectionId: string;
}

export const FeatureMetricsChart = ({
    metrics,
    hoursBack,
    statsSectionId,
}: IFeatureMetricsChartProps) => {
    const theme = useTheme();
    const { locationSettings } = useLocationSettings();

    const sortedMetrics = useMemo(() => {
        return [...metrics].sort((metricA, metricB) => {
            return metricA.timestamp.localeCompare(metricB.timestamp);
        });
    }, [metrics]);

    const options = useMemo(() => {
        return createChartOptions(
            theme,
            sortedMetrics,
            hoursBack,
            locationSettings,
        );
    }, [theme, sortedMetrics, hoursBack, locationSettings]);

    const data = useMemo(() => {
        return createChartData(theme, sortedMetrics, locationSettings);
    }, [theme, sortedMetrics, locationSettings]);

    return (
        <div style={{ height: 400 }}>
            <Bar
                data={data}
                options={options}
                aria-label='A stacked bar chart showing feature flag exposure metrics: exposed and not exposed requests.'
                aria-describedby={statsSectionId}
            />
        </div>
    );
};

// Register dependencies that we need to draw the chart.
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    TimeScale,
    Legend,
    Tooltip,
    Title,
);

// Use a default export to lazy-load the charting library.
export default FeatureMetricsChart;
