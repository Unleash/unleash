import { type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import {
    ExecutiveSummarySchema,
    ExecutiveSummarySchemaProjectFlagTrendsItem,
} from 'openapi';
import { LineChart } from '../LineChart/LineChart';
import { useProjectChartData } from '../useProjectChartData';
import { TooltipState } from '../LineChart/ChartTooltip/ChartTooltip';
import { Box, Divider, Paper, styled } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import { Typography } from '@mui/material';

interface IFlagsProjectChartProps {
    projectFlagTrends: ExecutiveSummarySchema['projectFlagTrends'];
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
            label: point.label,
            title: point.dataset.label,
            color: point.dataset.borderColor,
            value: point.raw as ExecutiveSummarySchemaProjectFlagTrendsItem,
        };
    });

    return (
        <Box
            sx={(theme) => ({
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing(3),
                width: '300px',
            })}
        >
            {data?.map((point, index) => (
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
                        <Typography
                            variant='body2'
                            color='textSecondary'
                            component='span'
                        >
                            Project health
                        </Typography>
                    </StyledItemHeader>
                    <StyledItemHeader>
                        <Typography variant='body2' component='span'>
                            <Typography
                                sx={{ color: point.color }}
                                component='span'
                            >
                                {'● '}
                            </Typography>
                            <strong>{point.title}</strong>
                        </Typography>
                        <Badge color={getHealthBadgeColor(point.value.health)}>
                            {point.value.health}%
                        </Badge>
                    </StyledItemHeader>
                </StyledTooltipItemContainer>
            )) || null}
        </Box>
    );
};

export const ProjectHealthChart: VFC<IFlagsProjectChartProps> = ({
    projectFlagTrends,
}) => {
    const data = useProjectChartData(projectFlagTrends);

    return (
        <LineChart
            data={data}
            isLocalTooltip
            TooltipComponent={TooltipComponent}
            overrideOptions={{
                parsing: {
                    yAxisKey: 'health',
                    xAxisKey: 'date',
                },
            }}
        />
    );
};
