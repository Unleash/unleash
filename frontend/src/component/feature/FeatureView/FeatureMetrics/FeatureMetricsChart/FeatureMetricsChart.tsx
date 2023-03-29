import { IFeatureMetricsRaw } from 'interfaces/featureToggle';
import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    TimeScale,
    Title,
    Tooltip,
} from 'chart.js';
import { useLocationSettings } from 'hooks/useLocationSettings';
import 'chartjs-adapter-date-fns';
import { createChartData } from './createChartData';
import { createChartOptions } from './createChartOptions';
import { useThemeMode } from 'hooks/useThemeMode';

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
    const { resolveTheme } = useThemeMode();
    const { locationSettings } = useLocationSettings();

    const theme = resolveTheme();

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
            locationSettings
        );
    }, [theme, sortedMetrics, hoursBack, locationSettings]);

    const data = useMemo(() => {
        return createChartData(theme, sortedMetrics, locationSettings);
    }, [theme, sortedMetrics, locationSettings]);

    return (
        <div style={{ height: 400 }}>
            <Line
                options={options}
                data={data}
                aria-label="A feature metrics line chart, with three lines: all requests, positive requests, and negative requests."
                aria-describedby={statsSectionId}
            />
        </div>
    );
};

// Register dependencies that we need to draw the chart.
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    TimeScale,
    Legend,
    Tooltip,
    Title
);

// Use a default export to lazy-load the charting library.
export default FeatureMetricsChart;
