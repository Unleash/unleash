import type { FC, ReactNode } from 'react';
import { useMemo } from 'react';
import { Alert, Box, Typography } from '@mui/material';
import {
    LineChart,
    NotEnoughData,
} from '../insights/components/LineChart/LineChart.tsx';
import { useImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import { usePlaceholderData } from '../insights/hooks/usePlaceholderData.js';
import { getDisplayFormat, getTimeUnit, formatLargeNumbers } from './utils.ts';
import { fromUnixTime } from 'date-fns';
import { useChartData } from './hooks/useChartData.ts';
import type { AggregationMode } from './types.ts';

type ImpactMetricsChartProps = {
    selectedSeries: string;
    selectedRange: 'hour' | 'day' | 'week' | 'month';
    selectedLabels: Record<string, string[]>;
    beginAtZero: boolean;
    aggregationMode?: AggregationMode;
    aspectRatio?: number;
    overrideOptions?: Record<string, unknown>;
    errorTitle?: string;
    emptyDataDescription?: string;
    noSeriesPlaceholder?: ReactNode;
    isPreview?: boolean;
};

export const ImpactMetricsChart: FC<ImpactMetricsChartProps> = ({
    selectedSeries,
    selectedRange,
    selectedLabels,
    beginAtZero,
    aggregationMode,
    aspectRatio,
    overrideOptions = {},
    errorTitle = 'Failed to load impact metrics.',
    emptyDataDescription = 'Send impact metrics using Unleash SDK and select data series to view the chart.',
    noSeriesPlaceholder,
    isPreview,
}) => {
    const {
        data: { start, end, series: timeSeriesData, debug },
        loading: dataLoading,
        error: dataError,
    } = useImpactMetricsData(
        selectedSeries
            ? {
                  series: selectedSeries,
                  range: selectedRange,
                  aggregationMode,
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

    const data = useChartData(timeSeriesData, debug?.query);

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

    const hasManyLabels = Object.keys(selectedLabels).length > 0;

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
                  },
              },
              plugins: {
                  legend: {
                      display:
                          timeSeriesData &&
                          (hasManyLabels || timeSeriesData.length > 1),
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
            {isPreview && debug?.query ? (
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
            {isPreview && debug?.isTruncated ? (
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
