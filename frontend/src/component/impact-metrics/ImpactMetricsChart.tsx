import type { FC, ReactNode } from 'react';
import { useMemo } from 'react';
import { Alert } from '@mui/material';
import {
    LineChart,
    NotEnoughData,
} from '../insights/components/LineChart/LineChart.tsx';
import { useImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import { usePlaceholderData } from '../insights/hooks/usePlaceholderData.js';
import { getDisplayFormat, getTimeUnit, formatLargeNumbers } from './utils.ts';
import { fromUnixTime } from 'date-fns';
import { useChartData } from './hooks/useChartData.ts';

type ImpactMetricsChartProps = {
    selectedSeries: string;
    selectedRange: 'hour' | 'day' | 'week' | 'month';
    selectedLabels: Record<string, string[]>;
    beginAtZero: boolean;
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
    aspectRatio,
    overrideOptions = {},
    errorTitle = 'Failed to load impact metrics. Please check if Prometheus is configured and the feature flag is enabled.',
    emptyDataDescription = 'Send impact metrics using Unleash SDK and select data series to view the chart.',
    noSeriesPlaceholder,
}) => {
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

    const data = useChartData(timeSeriesData);

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
            <LineChart
                data={notEnoughData || isLoading ? placeholderData : data}
                aspectRatio={aspectRatio}
                overrideOptions={chartOptions}
                cover={cover}
            />
        </>
    );
};
