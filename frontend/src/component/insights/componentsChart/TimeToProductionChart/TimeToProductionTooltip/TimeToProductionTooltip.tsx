import type { VFC } from 'react';
import type { InstanceInsightsSchemaProjectFlagTrendsItem } from 'openapi';
import { Box, Paper, Typography, styled } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import type { TooltipState } from 'component/insights/components/LineChart/ChartTooltip/ChartTooltip';

const StyledTooltipItemContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
}));

const StyledItemHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    alignItems: 'center',
}));

const getInterval = (days?: number) => {
    if (!days) {
        return 0;
    }

    if (days > 11) {
        const weeks = days / 7;
        if (weeks > 6) {
            const months = weeks / 4.34524;
            return `${months.toFixed(2)} months`;
        } else {
            return `${weeks.toFixed(1)} weeks`;
        }
    } else {
        return `${days.toFixed(2)} days`;
    }
};

const resolveBadge = (input?: number) => {
    const ONE_MONTH = 30;
    const ONE_WEEK = 7;

    if (!input) {
        return null;
    }

    if (input >= ONE_MONTH) {
        return <Badge color='error'>Low</Badge>;
    }

    if (input <= ONE_MONTH && input >= ONE_WEEK + 1) {
        return <Badge>Medium</Badge>;
    }

    if (input <= ONE_WEEK) {
        return <Badge color='success'>High</Badge>;
    }
};

export const TimeToProductionTooltip: VFC<{ tooltip: TooltipState | null }> = ({
    tooltip,
}) => {
    const data = tooltip?.dataPoints.map((point) => {
        return {
            label: point.label,
            title: point.dataset.label,
            color: point.dataset.borderColor,
            value: point.raw as InstanceInsightsSchemaProjectFlagTrendsItem,
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
                        <Typography
                            variant='body2'
                            component='span'
                            sx={{ mr: (theme) => theme.spacing(1), pt: 0.25 }}
                        >
                            {getInterval(point.value.timeToProduction)}
                        </Typography>
                        {resolveBadge(point.value.timeToProduction)}
                    </StyledItemHeader>
                </StyledTooltipItemContainer>
            )) || null}
        </Box>
    );
};
