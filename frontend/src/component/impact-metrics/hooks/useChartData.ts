import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import type { ImpactMetricsSeries } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import { useSeriesColor } from './useSeriesColor.ts';
import { getSeriesLabel } from '../utils.ts';

export const useChartData = (
    timeSeriesData: ImpactMetricsSeries[] | undefined,
) => {
    const theme = useTheme();
    const getSeriesColor = useSeriesColor();

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

            return {
                labels: timestamps,
                datasets: [
                    {
                        data: values,
                        borderColor: theme.palette.primary.main,
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

            const datasets = timeSeriesData.map((series) => {
                const seriesLabel = getSeriesLabel(series.metric);
                const color = getSeriesColor(seriesLabel);

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
    }, [timeSeriesData, theme, getSeriesColor]);
};
