import { Box, Typography, Link, Divider, styled } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link as RouterLink } from 'react-router-dom';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { ImpactMetricsChart } from 'component/impact-metrics/ImpactMetricsChart';
import type { MetricQuerySchemaTimeRange } from 'openapi/models/metricQuerySchemaTimeRange';
import type { MetricQuerySchemaAggregationMode } from 'openapi/models/metricQuerySchemaAggregationMode';

const StyledMiniChartWrapper = styled(Box)(({ theme }) => ({
    width: 80,
    marginRight: theme.spacing(1),
    cursor: 'pointer',
}));

const StyledTooltipHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2),
}));

const StyledChartContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    paddingBottom: theme.spacing(5),
}));

const StyledViewLink = styled(Link)<{ component?: any; to?: string }>(
    ({ theme }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.25),
        whiteSpace: 'nowrap',
        textDecoration: 'none',
        fontWeight: theme.fontWeight.bold,
        fontSize: theme.typography.body2.fontSize,
        color: theme.palette.primary.main,
        '&:hover': {
            textDecoration: 'none',
        },
    }),
);

interface MiniChartWithDataProps {
    metricName: string;
    metricDisplayName?: string;
    timeRange: MetricQuerySchemaTimeRange;
    labelSelectors: Record<string, string[]>;
    aggregationMode?: MetricQuerySchemaAggregationMode;
    threshold: number;
    projectId: string;
    featureId: string;
}

export const MiniChartWithData: React.FC<MiniChartWithDataProps> = ({
    metricName,
    metricDisplayName,
    timeRange,
    labelSelectors,
    aggregationMode,
    threshold,
    projectId,
    featureId,
}) => {
    const tooltipContent = (
        <Box sx={{ width: 400 }}>
            <StyledTooltipHeader>
                <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                    {metricDisplayName || metricName}
                </Typography>
                <StyledViewLink
                    component={RouterLink}
                    to={`/projects/${projectId}/features/${featureId}/metrics`}
                >
                    View
                    <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </StyledViewLink>
            </StyledTooltipHeader>
            <Divider />
            <StyledChartContainer>
                <ImpactMetricsChart
                    metricName={metricName}
                    timeRange={timeRange}
                    labelSelectors={labelSelectors}
                    yAxisMin='auto'
                    aggregationMode={aggregationMode}
                    isPreview={false}
                    showComponents={['xAxis', 'yAxis', 'notEnoughDataMessage']}
                    threshold={threshold}
                />
            </StyledChartContainer>
        </Box>
    );

    return (
        <HtmlTooltip
            title={tooltipContent}
            placement='left'
            arrow
            maxWidth={450}
        >
            <StyledMiniChartWrapper>
                <ImpactMetricsChart
                    metricName={metricName}
                    timeRange={timeRange}
                    labelSelectors={labelSelectors}
                    yAxisMin='auto'
                    aggregationMode={aggregationMode}
                    isPreview={true}
                    showComponents={[]}
                    threshold={threshold}
                    overrideOptions={{
                        interaction: {
                            mode: 'none',
                        },
                        plugins: {
                            tooltip: {
                                enabled: false,
                            },
                        },
                        elements: {
                            line: {
                                borderWidth: 1.25,
                            },
                            point: {
                                radius: 0,
                                hoverRadius: 0,
                            },
                        },
                    }}
                />
            </StyledMiniChartWrapper>
        </HtmlTooltip>
    );
};
