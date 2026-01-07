import type { FC, ReactNode } from 'react';
import { useMemo } from 'react';
import { Alert, Box } from '@mui/material';
import {
    LineChart,
    NotEnoughData,
} from '../insights/components/LineChart/LineChart.tsx';
import { usePlausibleMetrics } from 'hooks/api/getters/usePlausibleMetrics/usePlausibleMetrics';
import { usePlaceholderData } from '../insights/hooks/usePlaceholderData.js';
import { formatLargeNumbers } from './metricsFormatters.js';
import type { ChartData } from 'chart.js';

type PlausibleChartProps = {
    aspectRatio?: number;
    overrideOptions?: Record<string, unknown>;
    errorTitle?: string;
    emptyDataDescription?: string;
    noSeriesPlaceholder?: ReactNode;
    isPreview?: boolean;
};

export const PlausibleChart: FC<PlausibleChartProps> = ({
    aspectRatio,
    overrideOptions = {},
    errorTitle = 'Failed to load Plausible metrics.',
    emptyDataDescription = 'No Plausible analytics data available.',
    noSeriesPlaceholder,
    isPreview,
}) => {
    const {
        data: plausibleData,
        loading: dataLoading,
        error: dataError,
    } = usePlausibleMetrics();

    const placeholderData = usePlaceholderData({
        fill: true,
        type: 'constant',
    });

    const chartData: ChartData<'line'> = useMemo(() => {
        if (!plausibleData?.data || plausibleData.data.length === 0) {
            return {
                labels: [],
                datasets: [],
            };
        }

        const sortedData = [...plausibleData.data].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );

        return {
            labels: sortedData.map((item) => item.date),
            datasets: [
                {
                    label: 'Events',
                    data: sortedData.map((item) => item.count),
                    borderColor: 'rgb(129, 122, 254)',
                    backgroundColor: 'rgba(129, 122, 254, 0.1)',
                    fill: true,
                    tension: 0.1,
                },
            ],
        };
    }, [plausibleData]);

    const hasError = !!dataError;
    const isLoading = dataLoading;
    const notEnoughData = useMemo(
        () =>
            !isLoading &&
            (!plausibleData?.data ||
                plausibleData.data.length === 0 ||
                !chartData.datasets.some((d) => d.data.length > 1)),
        [chartData, isLoading, plausibleData],
    );

    const placeholder = noSeriesPlaceholder ? (
        noSeriesPlaceholder
    ) : (
        <NotEnoughData
            title='No Plausible data available'
            description={emptyDataDescription}
        />
    );

    const cover = notEnoughData ? placeholder : isLoading;

    const chartOptions = {
        ...overrideOptions,
        scales: {
            x: {
                type: 'time' as const,
                time: {
                    unit: 'hour' as const,
                    displayFormats: {
                        hour: 'MMM dd, HH:mm',
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
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Events',
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
                display: true,
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
                    data={
                        notEnoughData || isLoading ? placeholderData : chartData
                    }
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
        </>
    );
};
