import type { FC } from 'react';
import { Typography } from '@mui/material';
import { StyledChartContainer } from 'component/insights/InsightsCharts.styles';
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
}) => (
    <>
        <Typography variant='h6' color='text.secondary'>
            Preview
        </Typography>

        {!selectedSeries ? (
            <Typography variant='body2' color='text.secondary'>
                Select a metric series to view the preview
            </Typography>
        ) : null}

        <StyledChartContainer>
            <ImpactMetricsChart
                selectedSeries={selectedSeries}
                selectedRange={selectedRange}
                selectedLabels={selectedLabels}
                beginAtZero={beginAtZero}
                showRate={showRate}
                isPreview
            />
        </StyledChartContainer>
    </>
);
