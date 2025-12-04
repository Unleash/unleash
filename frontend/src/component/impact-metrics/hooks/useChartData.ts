import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import type { ImpactMetricsSeries } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import { getSeriesLabel } from '../metricsFormatters.ts';
import type { ChartDataset } from 'chart.js';

const getColorStartingIndex = (modulo: number, series?: string): number => {
    if (!series || series.length === 0 || modulo <= 0) {
        return 0;
    }

    // https://stackoverflow.com/a/7616484/1729641
    let hash = 0;
    for (let i = 0; i < series.length; i++) {
        const char = series.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }

    return Math.abs(hash) % modulo;
};

interface UseChartDataParams {
    timeSeriesData: ImpactMetricsSeries[] | undefined;
    colorIndexBy?: string;
    threshold?: number;
}

export const useChartData = ({
    timeSeriesData,
    colorIndexBy,
    threshold,
}: UseChartDataParams) => {
    const theme = useTheme();
    const colors = theme.palette.charts.series;
    const startColorIndex = getColorStartingIndex(colors.length, colorIndexBy);

    return useMemo(() => {
        if (!timeSeriesData || timeSeriesData.length === 0) {
            return {
                labels: [],
                datasets: [
                    {
                        data: [],
                        borderColor: theme.palette.primary.main,
                        backgroundColor: theme.palette.primary.light,
                    },
                ],
            };
        }

        if (timeSeriesData.length === 1) {
            const series = timeSeriesData[0];
            const timestamps = series.data.map(
                ([epochTimestamp]) => new Date(epochTimestamp * 1000),
            );
            const values = series.data.map(([, value]) => value);

            const datasets: ChartDataset<'line', (number | null)[]>[] = [
                {
                    data: values,
                    borderColor: theme.palette.primary.main,
                    backgroundColor: theme.palette.primary.light,
                    label: getSeriesLabel(series.metric),
                },
            ];

            if (threshold !== undefined) {
                const thresholdData = timestamps.map(() => threshold);
                datasets.push({
                    data: thresholdData,
                    borderColor: theme.palette.error.main,
                    backgroundColor: 'transparent',
                    borderDash: [4, 3],
                    label: `Threshold`,
                });
            }

            return {
                labels: timestamps,
                datasets,
            };
        } else {
            // Create a comprehensive timestamp range for consistent X-axis
            const allTimestamps = new Set<number>();
            timeSeriesData.forEach((series) => {
                series.data.forEach(([timestamp]) => {
                    allTimestamps.add(timestamp);
                });
            });

            if (allTimestamps.size === 0) {
                return {
                    labels: [],
                    datasets: [],
                };
            }

            const sortedTimestamps = Array.from(allTimestamps).sort(
                (a, b) => a - b,
            );

            const labels = sortedTimestamps.map(
                (timestamp) => new Date(timestamp * 1000),
            );

            const datasets: ChartDataset<'line', (number | null)[]>[] =
                timeSeriesData.map((series, index) => {
                    const seriesLabel = getSeriesLabel(series.metric);
                    const color =
                        colors[(index + startColorIndex) % colors.length];

                    const dataMap = new Map(series.data);

                    const data = sortedTimestamps.map(
                        (timestamp) => dataMap.get(timestamp) ?? null,
                    );

                    return {
                        label: seriesLabel,
                        data,
                        borderColor: color,
                        backgroundColor: color,
                        fill: false,
                    };
                });

            if (threshold !== undefined) {
                const thresholdData = sortedTimestamps.map(() => threshold);
                datasets.push({
                    data: thresholdData,
                    borderColor: theme.palette.error.main,
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    label: `Threshold (${threshold})`,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    fill: false,
                });
            }

            return {
                labels,
                datasets,
            };
        }
    }, [timeSeriesData, theme, threshold, startColorIndex]);
};
