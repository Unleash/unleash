import type { FC } from 'react';
import { styled, Typography } from '@mui/material';
import { ImpactMetricsChart } from 'component/impact-metrics/ImpactMetricsChart';
import type { ImpactMetricsConfigSchema } from 'openapi';

const StyledCard = styled('div')(({ theme }) => ({
    padding: theme.spacing(0),
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0),
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    padding: theme.spacing(1.5, 2, 0, 2),
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
}));

const StyledSubtitle = styled(Typography)(({ theme }) => ({
    padding: theme.spacing(0, 2, 0, 2),
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

const StyledChartWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(1.5, 2, 1, 0.5),
    height: theme.spacing(16),
}));

const timeRangeLabels: Record<string, string> = {
    hour: 'Last hour',
    day: 'Last 24 hours',
    week: 'Last 7 days',
    month: 'Last 30 days',
};

interface CompactChartCardProps {
    config: ImpactMetricsConfigSchema;
}

export const CompactChartCard: FC<CompactChartCardProps> = ({ config }) => {
    const title = config.title || config.displayName;
    const timeLabel = timeRangeLabels[config.timeRange] ?? config.timeRange;

    return (
        <StyledCard>
            <StyledTitle>{title}</StyledTitle>
            <StyledSubtitle>
                {timeLabel} &middot; {config.aggregationMode}
            </StyledSubtitle>
            <StyledChartWrapper>
                <ImpactMetricsChart
                    metricName={config.metricName}
                    timeRange={config.timeRange}
                    labelSelectors={config.labelSelectors}
                    yAxisMin={config.yAxisMin}
                    aggregationMode={config.aggregationMode}
                    showComponents={['xAxis', 'yAxis']}
                    overrideOptions={{
                        maintainAspectRatio: false,
                        elements: {
                            point: { radius: 0 },
                            line: { tension: 0.4, borderWidth: 2 },
                        },
                        scales: {
                            x: {
                                ticks: {
                                    maxTicksLimit: 3,
                                    maxRotation: 0,
                                    font: { size: 10 },
                                },
                                grid: { display: false },
                            },
                            y: {
                                title: { display: false },
                                ticks: {
                                    maxTicksLimit: 3,
                                    font: { size: 10 },
                                },
                                grid: { drawBorder: false },
                            },
                        },
                        plugins: {
                            tooltip: { enabled: false },
                        },
                    }}
                />
            </StyledChartWrapper>
        </StyledCard>
    );
};
