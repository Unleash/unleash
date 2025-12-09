import { Box, styled } from '@mui/material';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';
import { ImpactMetricsChart } from 'component/impact-metrics/ImpactMetricsChart';
import type { MetricQuerySchemaTimeRange } from 'openapi/models/metricQuerySchemaTimeRange';
import type { MetricQuerySchemaAggregationMode } from 'openapi/models/metricQuerySchemaAggregationMode';

const StyledMiniChartWrapper = styled(Box)(({ theme }) => ({
    width: 80,
    marginRight: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(0.75),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const StyledQuestionMarkIcon = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.common.white,
    '& svg': {
        fontSize: '14px',
    },
}));

const StyledChartContainer = styled(Box)({
    flex: 1,
    minWidth: 0,
});

interface MiniChartNoDataProps {
    metricName: string;
    timeRange: MetricQuerySchemaTimeRange;
    labelSelectors: Record<string, string[]>;
    aggregationMode?: MetricQuerySchemaAggregationMode;
    threshold: number;
}

export const MiniChartNoData: React.FC<MiniChartNoDataProps> = ({
    metricName,
    timeRange,
    labelSelectors,
    aggregationMode,
    threshold,
}) => {
    return (
        <TooltipResolver title='Not enough data' placement='top' arrow>
            <StyledMiniChartWrapper>
                <StyledChartContainer>
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
                </StyledChartContainer>
                <StyledQuestionMarkIcon>
                    <QuestionMarkIcon />
                </StyledQuestionMarkIcon>
            </StyledMiniChartWrapper>
        </TooltipResolver>
    );
};
