import type { FC } from 'react';
import { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Alert,
} from '@mui/material';
import { ImpactMetricsControls } from './ImpactMetricsControls.tsx';
import {
    LineChart,
    NotEnoughData,
} from '../insights/components/LineChart/LineChart.tsx';
import { StyledChartContainer } from 'component/insights/InsightsCharts.styles';
import { useImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import { usePlaceholderData } from '../insights/hooks/usePlaceholderData.js';
import { getDisplayFormat, getTimeUnit, formatLargeNumbers } from './utils.ts';
import { fromUnixTime } from 'date-fns';
import { useChartData } from './hooks/useChartData.ts';
import type { ChartConfig } from './types.ts';
import type { ImpactMetricsSeries } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';

export interface ChartConfigModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (config: Omit<ChartConfig, 'id'>) => void;
    initialConfig?: ChartConfig;
    metricSeries: (ImpactMetricsSeries & { name: string })[];
    loading?: boolean;
}

export const ChartConfigModal: FC<ChartConfigModalProps> = ({
    open,
    onClose,
    onSave,
    initialConfig,
    metricSeries,
    loading = false,
}) => {
    const [title, setTitle] = useState(initialConfig?.title || '');
    const [selectedSeries, setSelectedSeries] = useState(
        initialConfig?.selectedSeries || '',
    );
    const [selectedRange, setSelectedRange] = useState<
        'hour' | 'day' | 'week' | 'month'
    >(initialConfig?.selectedRange || 'day');
    const [beginAtZero, setBeginAtZero] = useState(
        initialConfig?.beginAtZero || false,
    );
    const [selectedLabels, setSelectedLabels] = useState<
        Record<string, string[]>
    >(initialConfig?.selectedLabels || {});

    // Data for preview
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

    // Fetch available labels for the currently selected series
    const {
        data: { labels: currentAvailableLabels },
    } = useImpactMetricsData(
        selectedSeries
            ? {
                  series: selectedSeries,
                  range: selectedRange,
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
        <NotEnoughData description='Send impact metrics using Unleash SDK and select data series to view the chart.' />
    ) : (
        <NotEnoughData
            title='Select a metric series to view the chart.'
            description=''
        />
    );
    const cover = notEnoughData ? placeholder : isLoading;

    useEffect(() => {
        if (open && initialConfig) {
            setTitle(initialConfig.title || '');
            setSelectedSeries(initialConfig.selectedSeries);
            setSelectedRange(initialConfig.selectedRange);
            setBeginAtZero(initialConfig.beginAtZero);
            setSelectedLabels(initialConfig.selectedLabels);
        } else if (open && !initialConfig) {
            setTitle('');
            setSelectedSeries('');
            setSelectedRange('day');
            setBeginAtZero(false);
            setSelectedLabels({});
        }
    }, [open, initialConfig]);

    const handleSave = () => {
        if (!selectedSeries) return;

        onSave({
            title: title || undefined,
            selectedSeries,
            selectedRange,
            beginAtZero,
            selectedLabels,
        });
        onClose();
    };

    const handleSeriesChange = (series: string) => {
        setSelectedSeries(series);
        setSelectedLabels({});
    };

    const isValid = selectedSeries.length > 0;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth='lg'
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    minHeight: '600px',
                    maxHeight: '90vh',
                },
            }}
        >
            <DialogTitle>
                {initialConfig ? 'Edit Chart' : 'Add New Chart'}
            </DialogTitle>
            <DialogContent>
                <Box
                    sx={(theme) => ({
                        display: 'flex',
                        flexDirection: { xs: 'column', lg: 'row' },
                        gap: theme.spacing(3),
                        pt: theme.spacing(1),
                        height: '100%',
                    })}
                >
                    {/* Configuration Panel */}
                    <Box
                        sx={(theme) => ({
                            flex: { xs: 'none', lg: '0 0 400px' },
                            display: 'flex',
                            flexDirection: 'column',
                            gap: theme.spacing(3),
                        })}
                    >
                        <TextField
                            label='Chart Title (optional)'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            fullWidth
                            variant='outlined'
                            size='small'
                        />

                        <ImpactMetricsControls
                            selectedSeries={selectedSeries}
                            onSeriesChange={handleSeriesChange}
                            selectedRange={selectedRange}
                            onRangeChange={setSelectedRange}
                            beginAtZero={beginAtZero}
                            onBeginAtZeroChange={setBeginAtZero}
                            metricSeries={metricSeries}
                            loading={loading}
                            selectedLabels={selectedLabels}
                            onLabelsChange={setSelectedLabels}
                            availableLabels={currentAvailableLabels}
                        />
                    </Box>

                    {/* Preview Panel */}
                    <Box
                        sx={(theme) => ({
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: theme.spacing(2),
                            minHeight: { xs: '300px', lg: '400px' },
                        })}
                    >
                        <Typography variant='h6' color='text.secondary'>
                            Preview
                        </Typography>

                        {!selectedSeries && !isLoading ? (
                            <Typography variant='body2' color='text.secondary'>
                                Select a metric series to view the preview
                            </Typography>
                        ) : null}

                        <StyledChartContainer>
                            {hasError ? (
                                <Alert severity='error'>
                                    Failed to load impact metrics. Please check
                                    if Prometheus is configured and the feature
                                    flag is enabled.
                                </Alert>
                            ) : null}
                            <LineChart
                                data={
                                    notEnoughData || isLoading
                                        ? placeholderData
                                        : data
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
                                                          callback: (
                                                              value: unknown,
                                                          ): string | number =>
                                                              typeof value ===
                                                              'number'
                                                                  ? formatLargeNumbers(
                                                                        value,
                                                                    )
                                                                  : (value as number),
                                                      },
                                                  },
                                              },
                                              plugins: {
                                                  legend: {
                                                      display:
                                                          timeSeriesData &&
                                                          timeSeriesData.length >
                                                              1,
                                                      position:
                                                          'bottom' as const,
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
                                          }
                                }
                                cover={cover}
                            />
                        </StyledChartContainer>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSave}
                    variant='contained'
                    disabled={!isValid}
                >
                    {initialConfig ? 'Update' : 'Add Chart'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
