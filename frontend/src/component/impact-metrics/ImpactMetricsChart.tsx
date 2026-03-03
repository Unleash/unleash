import type { FC, ReactNode } from 'react';
import { useMemo } from 'react';
import { Alert, Box, Typography } from '@mui/material';
import {
    LineChart,
    NotEnoughData,
} from '../insights/components/LineChart/LineChart.tsx';
import { useImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import { usePlaceholderData } from '../insights/hooks/usePlaceholderData.js';
import {
    getDisplayFormat,
    getTimeUnit,
    formatLargeNumbers,
} from './metricsFormatters.js';
import { fromUnixTime } from 'date-fns';
import { useChartData } from './hooks/useChartData.ts';
import type { AggregationMode } from './types.ts';

type ChartComponent =
    | 'xAxis'
    | 'yAxis'
    | 'debugInfo'
    | 'legend'
    | 'notEnoughDataMessage';

type ImpactMetricsChartProps = {
    metricName: string;
    timeRange: 'hour' | 'day' | 'week' | 'month';
    labelSelectors: Record<string, string[]>;
    yAxisMin: 'auto' | 'zero';
    aggregationMode?: AggregationMode;
    aspectRatio?: number;
    overrideOptions?: Record<string, unknown>;
    errorTitle?: string;
    emptyDataDescription?: string;
    noSeriesPlaceholder?: ReactNode;
    isPreview?: boolean;
    showComponents?: ChartComponent[];
    threshold?: number;
};

export const ImpactMetricsChart: FC<ImpactMetricsChartProps> = ({
    metricName,
    timeRange,
    labelSelectors,
    yAxisMin,
    aggregationMode,
    aspectRatio,
    overrideOptions = {},
    errorTitle = 'Failed to load impact metrics.',
    emptyDataDescription = 'Send impact metrics using Unleash SDK and select data series to view the chart.',
    noSeriesPlaceholder,
    isPreview,
    showComponents = [
        'xAxis',
        'yAxis',
        'debugInfo',
        'legend',
        'notEnoughDataMessage',
    ],
    threshold,
}) => {
    const shouldShowComponent = (component: ChartComponent) =>
        showComponents.includes(component);
    const {
        data: { start, end, series: timeSeriesData, debug },
        loading: dataLoading,
        error: dataError,
    } = useImpactMetricsData(
        metricName
            ? {
                  series: metricName,
                  range: timeRange,
                  aggregationMode,
                  labels:
                      Object.keys(labelSelectors).length > 0
                          ? labelSelectors
                          : undefined,
              }
            : undefined,
    );

    const placeholderData = usePlaceholderData({
        fill: true,
        type: 'constant',
    });

    const data = useChartData({
        timeSeriesData,
        colorIndexBy: debug?.query,
        threshold,
    });

    const hasError = !!dataError;
    const isLoading = dataLoading;
    const shouldShowPlaceholder = !metricName || isLoading || hasError;
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

    const getPlaceholder = () => {
        if (!shouldShowComponent('notEnoughDataMessage')) {
            return <div />;
        }

        if (metricName) {
            return <NotEnoughData description={emptyDataDescription} />;
        }

        if (noSeriesPlaceholder) {
            return noSeriesPlaceholder;
        }

        return (
            <NotEnoughData
                title='Select a metric series to view the chart.'
                description=''
            />
        );
    };

    const placeholder = getPlaceholder();

    const hasManyLabels = Object.keys(labelSelectors).length > 0;

    const cover = notEnoughData ? placeholder : isLoading;

    const overrideScales =
        (overrideOptions.scales as Record<string, unknown>) ?? {};
    const overridePlugins =
        (overrideOptions.plugins as Record<string, unknown>) ?? {};
    const { scales: _s, plugins: _p, ...restOverrides } = overrideOptions;

    const chartOptions = shouldShowPlaceholder
        ? overrideOptions
        : {
              ...restOverrides,
              scales: {
                  x: shouldShowComponent('xAxis')
                      ? {
                            type: 'time',
                            min: minTime?.getTime(),
                            max: maxTime?.getTime(),
                            time: {
                                unit: getTimeUnit(timeRange),
                                displayFormats: {
                                    [getTimeUnit(timeRange)]:
                                        getDisplayFormat(timeRange),
                                },
                                tooltipFormat: 'PPpp',
                            },
                            ticks: {
                                maxRotation: 45,
                                minRotation: 45,
                                maxTicksLimit: 8,
                            },
                            ...(overrideScales.x as Record<string, unknown>),
                        }
                      : {
                            display: false,
                        },
                  y: shouldShowComponent('yAxis')
                      ? {
                            beginAtZero: yAxisMin === 'zero',
                            title: {
                                display: aggregationMode === 'rps',
                                text:
                                    aggregationMode === 'rps'
                                        ? 'Rate per second'
                                        : '',
                            },
                            ticks: {
                                precision: 0,
                                callback: (value: unknown): string | number =>
                                    typeof value === 'number'
                                        ? `${formatLargeNumbers(value)}${aggregationMode === 'rps' ? '/s' : ''}`
                                        : (value as number),
                            },
                            ...(overrideScales.y as Record<string, unknown>),
                        }
                      : {
                            display: false,
                        },
              },
              plugins: {
                  legend: {
                      display:
                          shouldShowComponent('legend') &&
                          timeSeriesData &&
                          (hasManyLabels || timeSeriesData.length > 1),
                      position: 'bottom' as const,
                      labels: {
                          usePointStyle: true,
                          boxWidth: 8,
                          padding: 12,
                      },
                  },
                  ...overridePlugins,
              },
              animations: {
                  x: { duration: 0 },
                  y: { duration: 0 },
              },
          };

    return (
        <>
            <Box
                sx={
                    !isPreview
                        ? {
                              height: '100%',
                              width: '100%',
                              '& > div': {
                                  height: '100% !important',
                                  width: '100% !important',
                              },
                          }
                        : {}
                }
            >
                <LineChart
                    data={notEnoughData || isLoading ? placeholderData : data}
                    aspectRatio={aspectRatio}
                    overrideOptions={chartOptions}
                    cover={
                        hasError ? (
                            <Alert severity='error'>{errorTitle}</Alert>
                        ) : (
                            cover
                        )
                    }
                />
            </Box>
            {shouldShowComponent('debugInfo') && isPreview && debug?.query ? (
                <Box
                    sx={(theme) => ({
                        margin: theme.spacing(2),
                        padding: theme.spacing(2),
                        background: theme.palette.background.elevation1,
                    })}
                >
                    <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ wordBreak: 'break-all' }}
                    >
                        <code>{debug.query}</code>
                    </Typography>
                </Box>
            ) : null}
            {shouldShowComponent('debugInfo') &&
            isPreview &&
            debug?.isTruncated ? (
                <Box
                    sx={(theme) => ({
                        padding: theme.spacing(0, 2),
                    })}
                >
                    <Alert severity='warning'>
                        Showing only {timeSeriesData.length} series due to
                        performance. Please change filters for more accurate
                        results.
                    </Alert>
                </Box>
            ) : null}
        </>
    );
};
