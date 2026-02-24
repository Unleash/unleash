import { type FC, useMemo } from 'react';
import { styled, Tooltip, Typography } from '@mui/material';
import ShieldOutlined from '@mui/icons-material/ShieldOutlined';
import { ImpactMetricsChart } from 'component/impact-metrics/ImpactMetricsChart';
import { useImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import { formatLargeNumbers } from 'component/impact-metrics/metricsFormatters';
import type { ImpactMetricsConfigSchema } from 'openapi';
import { contentSpacingY } from 'themes/themeStyles';

const StyledCard = styled('div')(({ theme }) => ({
    padding: theme.spacing(0),
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0),
    minWidth: 0,
}));

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: theme.spacing(1.5, 2, 0, 2),
    gap: theme.spacing(1),
}));

const StyledHeaderLeft = styled('div')({
    display: 'flex',
    flexDirection: 'column',
});

const StyledTitleRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const StyledShieldIcon = styled(ShieldOutlined)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.primary.main,
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
}));

const StyledSubtitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

const StyledCurrentValue = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
    whiteSpace: 'nowrap',
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

    const { data } = useImpactMetricsData({
        series: config.metricName,
        range: config.timeRange,
        aggregationMode: config.aggregationMode,
        labels:
            Object.keys(config.labelSelectors).length > 0
                ? config.labelSelectors
                : undefined,
    });

    const currentValue = useMemo(() => {
        if (!data.series?.length) return null;
        const seriesData = data.series[0].data;
        if (!seriesData.length) return null;
        const lastValue = seriesData[seriesData.length - 1][1];
        const suffix = config.aggregationMode === 'rps' ? '/s' : '';
        return `${formatLargeNumbers(lastValue)}${suffix}`;
    }, [data.series, config.aggregationMode]);

    return (
        <StyledCard>
            <StyledHeader>
                <StyledHeaderLeft>
                    <StyledTitle>{title}</StyledTitle>
                    <StyledSubtitle>
                        {timeLabel} &middot; {config.aggregationMode}
                    </StyledSubtitle>
                </StyledHeaderLeft>
                <StyledTitleRow>
                    {currentValue !== null && (
                        <StyledCurrentValue>
                            {currentValue}
                        </StyledCurrentValue>
                    )}
                    {config.mode === 'read' && (
                        <Tooltip title='Used by a safeguard' arrow>
                            <StyledShieldIcon />
                        </Tooltip>
                    )}
                </StyledTitleRow>
            </StyledHeader>
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
