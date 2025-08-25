import type { FC } from 'react';
import { Box, Paper, Typography, styled, useTheme } from '@mui/material';
import type { TooltipState } from 'component/insights/components/LineChart/ChartTooltip/ChartTooltip';
import { ChartTooltipContainer } from 'component/insights/components/LineChart/ChartTooltip/ChartTooltip';
import { getFlagTypeColors } from './flagTypeColors.ts';
import type { WeekData } from './types.ts';

const StyledTooltipItemContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    width: 240,
}));

const StyledFlagTypeItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

interface CreationArchiveTooltipProps {
    tooltip: TooltipState | null;
}

export const CreationArchiveTooltip: FC<CreationArchiveTooltipProps> = ({
    tooltip,
}) => {
    const theme = useTheme();

    if (!tooltip?.dataPoints) {
        return null;
    }

    const createdFlagDataPoints = tooltip.dataPoints.filter(
        (point) =>
            point.dataset.label !== 'Archived flags' &&
            point.dataset.label !== 'Flags archived / Flags created',
    );

    if (createdFlagDataPoints.length === 0) {
        return null;
    }

    const rawData = createdFlagDataPoints[0]?.raw as WeekData;

    const flagTypeNames = createdFlagDataPoints.map(
        (point) => point.dataset.label || '',
    );

    const flagTypeColors = getFlagTypeColors(theme);

    return (
        <ChartTooltipContainer tooltip={tooltip}>
            <StyledTooltipItemContainer elevation={3}>
                <Typography
                    variant='body2'
                    component='div'
                    fontWeight='bold'
                    sx={{ marginBottom: 1 }}
                >
                    Flag type
                </Typography>

                <Typography variant='body2' component='span'>
                    <Typography
                        sx={{ color: flagTypeColors[0] }}
                        component='span'
                    >
                        {'● '}
                    </Typography>
                    Total created:
                </Typography>
                <Typography variant='body2' component='span'>
                    {rawData.totalCreatedFlags}
                </Typography>
            </StyledTooltipItemContainer>
        </ChartTooltipContainer>
    );
};
