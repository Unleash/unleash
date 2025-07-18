import type { FC } from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ImpactMetricsChart } from './ImpactMetricsChart.tsx';
import type { AggregationMode } from './types.ts';

type ImpactMetricsChartPreviewProps = {
    selectedSeries: string;
    selectedRange: 'hour' | 'day' | 'week' | 'month';
    selectedLabels: Record<string, string[]>;
    beginAtZero: boolean;
    aggregationMode?: AggregationMode;
};

export const ImpactMetricsChartPreview: FC<ImpactMetricsChartPreviewProps> = ({
    selectedSeries,
    selectedRange,
    selectedLabels,
    beginAtZero,
    aggregationMode,
}) => {
    const theme = useTheme();
    const screenBreakpoint = useMediaQuery(theme.breakpoints.down('lg'));
    const key = screenBreakpoint ? 'small' : 'large';

    return (
        <>
            <Typography variant='h6' color='text.secondary'>
                Preview
            </Typography>

            {!selectedSeries ? (
                <Typography variant='body2' color='text.secondary'>
                    Select a metric series to view the preview
                </Typography>
            ) : null}

            <Box sx={(theme) => ({ padding: theme.spacing(1) })}>
                <ImpactMetricsChart
                    key={key}
                    selectedSeries={selectedSeries}
                    selectedRange={selectedRange}
                    selectedLabels={selectedLabels}
                    beginAtZero={beginAtZero}
                    aggregationMode={aggregationMode}
                    isPreview
                />
            </Box>
        </>
    );
};
