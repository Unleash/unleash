import { type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import { ExecutiveSummarySchema } from 'openapi';
import { LineChart } from '../LineChart/LineChart';
import { useMetricsSummary } from '../useMetricsSummary';
import { Box, Paper, styled } from '@mui/material';
import { TooltipState } from '../LineChart/ChartTooltip/ChartTooltip';
import { Badge } from '../../common/Badge/Badge';

interface IMetricsSummaryChartProps {
    metricsSummaryTrends: ExecutiveSummarySchema['metricsSummaryTrends'];
}

const StyledTooltipItemContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
}));

const StyledItemHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    alignItems: 'center',
}));

const getHealthBadgeColor = (health?: number | null) => {
    if (health === undefined || health === null) {
        return 'info';
    }

    if (health >= 75) {
        return 'success';
    }

    if (health >= 50) {
        return 'warning';
    }

    return 'error';
};

const TooltipComponent: VFC<{ tooltip: TooltipState | null }> = ({
    tooltip,
}) => {
    const data = tooltip?.dataPoints.map((point) => {
        return {
            title: point.dataset.label,
            color: point.dataset.borderColor,
            value: point.raw as number,
        };
    });

    return (
        <Box
            sx={(theme) => ({
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing(3),
            })}
        >
            {data?.map((point, index) => (
                <StyledTooltipItemContainer elevation={3} key={point.title}>
                    <StyledItemHeader>
                        <div>{point.title}</div>{' '}
                        <Badge color={getHealthBadgeColor(point.value)}>
                            {point.value}%
                        </Badge>
                    </StyledItemHeader>
                </StyledTooltipItemContainer>
            )) || null}
        </Box>
    );
};

export const MetricsSummaryChart: VFC<IMetricsSummaryChartProps> = ({
    metricsSummaryTrends,
}) => {
    const data = useMetricsSummary(metricsSummaryTrends, 'total');

    return <LineChart data={data} />;
};
