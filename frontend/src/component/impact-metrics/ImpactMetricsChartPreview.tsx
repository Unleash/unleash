import type { FC } from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ImpactMetricsChart } from './ImpactMetricsChart.tsx';

type ImpactMetricsChartPreviewProps = {
    selectedSeries: string;
    selectedRange: 'hour' | 'day' | 'week' | 'month';
    selectedLabels: Record<string, string[]>;
    beginAtZero: boolean;
    showRate?: boolean;
};

export const ImpactMetricsChartPreview: FC<ImpactMetricsChartPreviewProps> = ({
    selectedSeries,
    selectedRange,
    selectedLabels,
    beginAtZero,
    showRate,
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
                    showRate={showRate}
                    isPreview
                />
            </Box>
        </>
    );
};
