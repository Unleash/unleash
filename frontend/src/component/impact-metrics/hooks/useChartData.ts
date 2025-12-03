import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import type { ImpactMetricsSeries } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import { getSeriesLabel } from '../metricsFormatters.ts';

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

const isThresholdExceeded = (
    data: (number | null)[],
    threshold?: number,
): boolean => {
    if (threshold === undefined) return false;
    return data.some((value) => value !== null && value > threshold);
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

            const hasThresholdExceeded = isThresholdExceeded(values, threshold);

            return {
                labels: timestamps,
                datasets: [
                    {
                        data: values,
                        borderColor: hasThresholdExceeded
                            ? theme.palette.error.main
                            : theme.palette.primary.main,
                        backgroundColor: theme.palette.primary.light,
                        label: getSeriesLabel(series.metric),
                    },
                ],
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

            const datasets = timeSeriesData.map((series, index) => {
                const seriesLabel = getSeriesLabel(series.metric);
                const color = colors[(index + startColorIndex) % colors.length];

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

            return {
                labels,
                datasets,
            };
        }
    }, [timeSeriesData, theme, threshold]);
};
