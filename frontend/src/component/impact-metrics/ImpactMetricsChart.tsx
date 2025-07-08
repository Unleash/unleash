import type { FC, ReactNode } from 'react';
import { useMemo } from 'react';
import { Alert, Box, styled, useTheme } from '@mui/material';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    LinearScale,
    TimeScale,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import {
    LineChart,
    NotEnoughData,
} from '../insights/components/LineChart/LineChart.tsx';
import { useImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import { usePlaceholderData } from '../insights/hooks/usePlaceholderData.js';
import { getDisplayFormat, getTimeUnit, formatLargeNumbers } from './utils.ts';
import { fromUnixTime } from 'date-fns';
import { useChartData } from './hooks/useChartData.ts';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    TimeScale,
    Tooltip,
    Legend,
);

const StyledBarChartContainer = styled(Box)({
    position: 'relative',
    width: '100%',
    height: '100%',
});

type ImpactMetricsChartProps = {
    selectedSeries: string;
    selectedRange: 'hour' | 'day' | 'week' | 'month';
    selectedLabels: Record<string, string[]>;
    beginAtZero: boolean;
    chartType?: 'line' | 'bar';
    aspectRatio?: number;
    overrideOptions?: Record<string, unknown>;
    errorTitle?: string;
    emptyDataDescription?: string;
    noSeriesPlaceholder?: ReactNode;
};

export const ImpactMetricsChart: FC<ImpactMetricsChartProps> = ({
    selectedSeries,
    selectedRange,
    selectedLabels,
    beginAtZero,
    chartType = 'bar',
    aspectRatio,
    overrideOptions = {},
    errorTitle = 'Failed to load impact metrics. Please check if Prometheus is configured and the feature flag is enabled.',
    emptyDataDescription = 'Send impact metrics using Unleash SDK and select data series to view the chart.',
    noSeriesPlaceholder,
}) => {
    const theme = useTheme();
    const {
        data: { start, end, series: timeSeriesData },
        loading: dataLoading,
        error: dataError,
    } = useImpactMetricsData(
        selectedSeries
            ? {
                  series: selectedSeries,
                  range: selectedRange,
                  labels:
                      Object.keys(selectedLabels).length > 0
                          ? selectedLabels
                          : undefined,
              }
            : undefined,
    );

    const placeholderData = usePlaceholderData({
        fill: true,
        type: 'constant',
    });

    const barPlaceholderData = useMemo(
        () => ({
            labels: placeholderData.labels,
            datasets: placeholderData.datasets.map((dataset) => ({
                label: dataset.label,
                data: dataset.data,
                backgroundColor: theme.palette.divider,
                borderColor: theme.palette.divider,
                borderWidth: 1,
            })),
        }),
        [placeholderData, theme],
    );

    const data = useChartData(timeSeriesData);

    const barChartData = useMemo(() => {
        if (!timeSeriesData || timeSeriesData.length === 0) {
            return {
                labels: [],
                datasets: [
                    {
                        data: [],
                        backgroundColor: theme.palette.primary.main,
                        borderColor: theme.palette.primary.main,
                        borderWidth: 1,
                    },
                ],
            };
        }

        return {
            labels: data.labels,
            datasets: data.datasets.map((dataset) => ({
                label: dataset.label,
                data: dataset.data,
                backgroundColor:
                    typeof dataset.backgroundColor === 'string'
                        ? dataset.backgroundColor
                        : theme.palette.primary.main,
                borderColor:
                    typeof dataset.borderColor === 'string'
                        ? dataset.borderColor
                        : theme.palette.primary.main,
                borderWidth: 1,
            })),
        };
    }, [data, timeSeriesData, theme]);

    const hasError = !!dataError;
    const isLoading = dataLoading;
    const shouldShowPlaceholder = !selectedSeries || isLoading || hasError;
    const notEnoughData = useMemo(
        () =>
            !isLoading &&
            (!timeSeriesData ||
                timeSeriesData.length === 0 ||
                !data.datasets.some((d) => d.data.length > 1)),
        [data, isLoading, timeSeriesData],
    );

    const minTime = start
        ? fromUnixTime(Number.parseInt(start, 10))
        : undefined;
    const maxTime = end ? fromUnixTime(Number.parseInt(end, 10)) : undefined;

    const placeholder = selectedSeries ? (
        <NotEnoughData description={emptyDataDescription} />
    ) : noSeriesPlaceholder ? (
        noSeriesPlaceholder
    ) : (
        <NotEnoughData
            title='Select a metric series to view the chart.'
            description=''
        />
    );
    const cover = notEnoughData ? placeholder : isLoading;

    const chartOptions = shouldShowPlaceholder
        ? overrideOptions
        : {
              ...overrideOptions,
              scales: {
                  x: {
                      type: 'time',
                      min: minTime?.getTime(),
                      max: maxTime?.getTime(),
                      time: {
                          unit: getTimeUnit(selectedRange),
                          displayFormats: {
                              [getTimeUnit(selectedRange)]:
                                  getDisplayFormat(selectedRange),
                          },
                          tooltipFormat: 'PPpp',
                      },
                      ticks: {
                          maxRotation: 45,
                          minRotation: 45,
                          maxTicksLimit: 8,
                      },
                  },
                  y: {
                      beginAtZero,
                      title: {
                          display: false,
                      },
                      ticks: {
                          precision: 0,
                          callback: (value: unknown): string | number =>
                              typeof value === 'number'
                                  ? formatLargeNumbers(value)
                                  : (value as number),
                      },
                  },
              },
              plugins: {
                  legend: {
                      display: timeSeriesData && timeSeriesData.length > 1,
                      position: 'bottom' as const,
                      labels: {
                          usePointStyle: true,
                          boxWidth: 8,
                          padding: 12,
                      },
                  },
              },
              animations: {
                  x: { duration: 0 },
                  y: { duration: 0 },
              },
          };

    return (
        <>
            {hasError ? <Alert severity='error'>{errorTitle}</Alert> : null}
            {chartType === 'bar' ? (
                <StyledBarChartContainer>
                    <Bar
                        data={
                            (notEnoughData || isLoading
                                ? barPlaceholderData
                                : barChartData) as any
                        }
                        options={chartOptions as any}
                        height={aspectRatio ? 100 : undefined}
                        width={aspectRatio ? 100 * aspectRatio : undefined}
                    />
                    {cover && (
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                zIndex: 1,
                            }}
                        >
                            {cover}
                        </Box>
                    )}
                </StyledBarChartContainer>
            ) : (
                <LineChart
                    data={notEnoughData || isLoading ? placeholderData : data}
                    aspectRatio={aspectRatio}
                    overrideOptions={chartOptions}
                    cover={cover}
                />
            )}
        </>
    );
};
