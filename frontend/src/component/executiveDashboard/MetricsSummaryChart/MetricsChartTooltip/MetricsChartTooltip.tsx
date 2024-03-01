import { type VFC } from "react";
import { ExecutiveSummarySchemaMetricsSummaryTrendsItem } from "openapi";
import { Box, Divider, Paper, styled, Typography } from "@mui/material";
import { TooltipState } from "../../LineChart/ChartTooltip/ChartTooltip";
import { HorizontalDistributionChart } from "../../HorizontalDistributionChart/HorizontalDistributionChart";

const StyledTooltipItemContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
}));

const StyledItemHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    alignItems: 'center',
}));

export const MetricsSummaryTooltip: VFC<{ tooltip: TooltipState | null }> = ({
    tooltip,
}) => {
    const data = tooltip?.dataPoints.map((point) => {
        return {
            label: point.label,
            title: point.dataset.label,
            color: point.dataset.borderColor,
            value: point.raw as ExecutiveSummarySchemaMetricsSummaryTrendsItem,
        };
    });

    const limitedData = data?.slice(0, 5);

    return (
        <Box
            sx={(theme) => ({
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing(2),
                width: '300px',
            })}
        >
            {limitedData?.map((point, index) => (
                <StyledTooltipItemContainer
                    elevation={3}
                    key={`${point.title}-${index}`}
                >
                    <StyledItemHeader>
                        <Typography
                            variant='body2'
                            color='textSecondary'
                            component='span'
                        >
                            {point.label}
                        </Typography>
                    </StyledItemHeader>
                    <Divider
                        sx={(theme) => ({ margin: theme.spacing(1.5, 0) })}
                    />
                    <Typography
                        variant='body2'
                        component='p'
                        sx={(theme) => ({
                            marginBottom: theme.spacing(0.5),
                        })}
                    >
                        Exposed: {point.value.totalYes}
                    </Typography>
                    <Typography
                        variant='body2'
                        component='p'
                        sx={(theme) => ({
                            marginBottom: theme.spacing(0.5),
                        })}
                    >
                        Not exposed: {point.value.totalNo}
                    </Typography>
                    <Typography
                        variant='body2'
                        component='p'
                        sx={(theme) => ({
                            marginBottom: theme.spacing(0.5),
                        })}
                    >
                        Apps: {point.value.totalApps}
                    </Typography>
                    <Typography
                        variant='body2'
                        component='p'
                        sx={(theme) => ({
                            marginBottom: theme.spacing(0.5),
                        })}
                    >
                        Environments: {point.value.totalEnvironments}
                    </Typography>
                </StyledTooltipItemContainer>
            )) || null}
        </Box>
    );
};
