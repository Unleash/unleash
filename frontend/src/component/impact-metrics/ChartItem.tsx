import type { FC } from 'react';
import { useMemo } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Alert,
    styled,
    Paper,
} from '@mui/material';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import DragHandle from '@mui/icons-material/DragHandle';
import {
    LineChart,
    NotEnoughData,
} from '../insights/components/LineChart/LineChart.tsx';
import { useImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import { usePlaceholderData } from '../insights/hooks/usePlaceholderData.js';
import { getDisplayFormat, getTimeUnit, formatLargeNumbers } from './utils.ts';
import { fromUnixTime } from 'date-fns';
import { useChartData } from './hooks/useChartData.ts';
import type { ChartConfig } from './types.ts';

export interface ChartItemProps {
    config: ChartConfig;
    onEdit: (config: ChartConfig) => void;
    onDelete: (id: string) => void;
}

const getConfigDescription = (config: ChartConfig): string => {
    const parts: string[] = [];

    if (config.selectedSeries) {
        parts.push(`Series: ${config.selectedSeries}`);
    }

    parts.push(`Time range: last ${config.selectedRange}`);

    if (config.beginAtZero) {
        parts.push('Begin at zero');
    }

    const labelCount = Object.keys(config.selectedLabels).length;
    if (labelCount > 0) {
        parts.push(`${labelCount} label filter${labelCount > 1 ? 's' : ''}`);
    }

    return parts.join(' • ');
};

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: theme.spacing(2, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledDragHandle = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    cursor: 'move',
    padding: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.text.secondary,
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        color: theme.palette.text.primary,
    },
}));

const StyledWidget = styled(Paper)(({ theme }) => ({
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
}));

const StyledChartContent = styled(Box)({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
});

const StyledImpactChartContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    minWidth: 0,
    flexGrow: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto 0',
    padding: theme.spacing(3),
}));

const StyledChartWrapper = styled(Box)({
    height: '100%',
    width: '100%',
    '& > div': {
        height: '100% !important',
        width: '100% !important',
    },
});

export const ChartItem: FC<ChartItemProps> = ({ config, onEdit, onDelete }) => {
    const {
        data: { start, end, series: timeSeriesData },
        loading: dataLoading,
        error: dataError,
    } = useImpactMetricsData({
        series: config.selectedSeries,
        range: config.selectedRange,
        labels:
            Object.keys(config.selectedLabels).length > 0
                ? config.selectedLabels
                : undefined,
    });

    const placeholderData = usePlaceholderData({
        fill: true,
        type: 'constant',
    });

    const data = useChartData(timeSeriesData);

    const hasError = !!dataError;
    const isLoading = dataLoading;
    const shouldShowPlaceholder = isLoading || hasError;
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

    const placeholder = (
        <NotEnoughData description='Send impact metrics using Unleash SDK for this series to view the chart.' />
    );
    const cover = notEnoughData ? placeholder : isLoading;

    return (
        <StyledWidget>
            <StyledHeader>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <StyledDragHandle className='grid-item-drag-handle'>
                        <DragHandle fontSize='small' />
                    </StyledDragHandle>
                    <Box>
                        {config.title && (
                            <Typography variant='h6' gutterBottom>
                                {config.title}
                            </Typography>
                        )}
                        <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ mb: 1 }}
                        >
                            {getConfigDescription(config)}
                        </Typography>
                    </Box>
                </Box>
                <Box>
                    <IconButton
                        onClick={() => onEdit(config)}
                        size='small'
                        sx={{ mr: 1 }}
                    >
                        <Edit fontSize='small' />
                    </IconButton>
                    <IconButton
                        onClick={() => onDelete(config.id)}
                        size='small'
                    >
                        <Delete fontSize='small' />
                    </IconButton>
                </Box>
            </StyledHeader>

            <StyledChartContent>
                <StyledImpactChartContainer>
                    {hasError ? (
                        <Alert severity='error'>
                            Failed to load impact metrics. Please check if
                            Prometheus is configured and the feature flag is
                            enabled.
                        </Alert>
                    ) : null}
                    <StyledChartWrapper>
                        <LineChart
                            data={
                                notEnoughData || isLoading
                                    ? placeholderData
                                    : data
                            }
                            aspectRatio={1.5}
                            overrideOptions={
                                shouldShowPlaceholder
                                    ? { maintainAspectRatio: false }
                                    : {
                                          maintainAspectRatio: false,
                                          scales: {
                                              x: {
                                                  type: 'time',
                                                  min: minTime?.getTime(),
                                                  max: maxTime?.getTime(),
                                                  time: {
                                                      unit: getTimeUnit(
                                                          config.selectedRange,
                                                      ),
                                                      displayFormats: {
                                                          [getTimeUnit(
                                                              config.selectedRange,
                                                          )]: getDisplayFormat(
                                                              config.selectedRange,
                                                          ),
                                                      },
                                                      tooltipFormat: 'PPpp',
                                                  },
                                              },
                                              y: {
                                                  beginAtZero:
                                                      config.beginAtZero,
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
                                                      timeSeriesData.length > 1,
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
                                      }
                            }
                            cover={cover}
                        />
                    </StyledChartWrapper>
                </StyledImpactChartContainer>
            </StyledChartContent>
        </StyledWidget>
    );
};
