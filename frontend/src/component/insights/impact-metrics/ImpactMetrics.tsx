import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useTheme, Box, Typography, Alert } from '@mui/material';
import {
    LineChart,
    NotEnoughData,
} from '../components/LineChart/LineChart.tsx';
import { InsightsSection } from '../sections/InsightsSection.tsx';
import {
    StyledChartContainer,
    StyledWidget,
    StyledWidgetStats,
} from 'component/insights/InsightsCharts.styles';
import { useImpactMetricsMetadata } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { useImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import { usePlaceholderData } from '../hooks/usePlaceholderData.js';
import { ImpactMetricsControls } from './ImpactMetricsControls.tsx';
import { getDisplayFormat, getTimeUnit } from './time-utils.ts';
import { fromUnixTime } from 'date-fns';

export const ImpactMetrics: FC = () => {
    const theme = useTheme();
    const [selectedSeries, setSelectedSeries] = useState<string>('');
    const [selectedRange, setSelectedRange] = useState<
        'hour' | 'day' | 'week' | 'month'
    >('day');
    const [beginAtZero, setBeginAtZero] = useState(false);

    const {
        metadata,
        loading: metadataLoading,
        error: metadataError,
    } = useImpactMetricsMetadata();
    const {
        data: { start, end, data: timeSeriesData },
        loading: dataLoading,
        error: dataError,
    } = useImpactMetricsData(
        selectedSeries
            ? { series: selectedSeries, range: selectedRange }
            : undefined,
    );

    const placeholderData = usePlaceholderData({
        fill: true,
        type: 'constant',
    });

    const metricSeries = useMemo(() => {
        if (!metadata?.series) {
            return [];
        }
        return Object.entries(metadata.series).map(([name, rest]) => ({
            name,
            ...rest,
        }));
    }, [metadata]);

    const data = useMemo(() => {
        if (!timeSeriesData.length) {
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

        const timestamps = timeSeriesData.map(
            ([epochTimestamp]) => new Date(epochTimestamp * 1000),
        );
        const values = timeSeriesData.map(([, value]) => value);

        return {
            labels: timestamps,
            datasets: [
                {
                    data: values,
                    borderColor: theme.palette.primary.main,
                    backgroundColor: theme.palette.primary.light,
                },
            ],
        };
    }, [timeSeriesData, theme]);

    const hasError = metadataError || dataError;
    const isLoading = metadataLoading || dataLoading;
    const shouldShowPlaceholder = !selectedSeries || isLoading || hasError;
    const notEnoughData = useMemo(
        () => !isLoading && !data.datasets.some((d) => d.data.length > 1),
        [data, isLoading],
    );

    const minTime = start
        ? fromUnixTime(Number.parseInt(start, 10))
        : undefined;
    const maxTime = end ? fromUnixTime(Number.parseInt(end, 10)) : undefined;

    const placeholder = selectedSeries ? (
        <NotEnoughData description='Send impact metrics using Unleash SDK and select data series to view the chart.' />
    ) : (
        <NotEnoughData
            title='Select a metric series to view the chart.'
            description=''
        />
    );
    const cover = notEnoughData ? placeholder : isLoading;

    return (
        <InsightsSection title='Impact metrics'>
            <StyledWidget>
                <StyledWidgetStats>
                    <Box
                        sx={(theme) => ({
                            display: 'flex',
                            flexDirection: 'column',
                            gap: theme.spacing(2),
                            width: '100%',
                        })}
                    >
                        <ImpactMetricsControls
                            selectedSeries={selectedSeries}
                            onSeriesChange={setSelectedSeries}
                            selectedRange={selectedRange}
                            onRangeChange={setSelectedRange}
                            beginAtZero={beginAtZero}
                            onBeginAtZeroChange={setBeginAtZero}
                            metricSeries={metricSeries}
                            loading={metadataLoading}
                        />

                        {!selectedSeries && !isLoading ? (
                            <Typography variant='body2' color='text.secondary'>
                                Select a metric series to view the chart
                            </Typography>
                        ) : null}
                    </Box>
                </StyledWidgetStats>

                <StyledChartContainer>
                    {hasError ? (
                        <Alert severity='error'>
                            Failed to load impact metrics. Please check if
                            Prometheus is configured and the feature flag is
                            enabled.
                        </Alert>
                    ) : null}
                    <LineChart
                        data={
                            notEnoughData || isLoading ? placeholderData : data
                        }
                        overrideOptions={
                            shouldShowPlaceholder
                                ? {}
                                : {
                                      scales: {
                                          x: {
                                              type: 'time',
                                              min: minTime?.getTime(),
                                              max: maxTime?.getTime(),
                                              time: {
                                                  unit: getTimeUnit(
                                                      selectedRange,
                                                  ),
                                                  displayFormats: {
                                                      [getTimeUnit(
                                                          selectedRange,
                                                      )]:
                                                          getDisplayFormat(
                                                              selectedRange,
                                                          ),
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
                                              },
                                          },
                                      },
                                      plugins: {
                                          legend: {
                                              display: false,
                                          },
                                      },
                                      animations: {
                                          x: { duration: 0 },
                                          y: { duration: 0 },
                                      },
                                  }
                        }
                        cover={cover}
                    />
                </StyledChartContainer>
            </StyledWidget>
        </InsightsSection>
    );
};
