import type { FC } from 'react';
import { Box, Paper, Typography, styled, useTheme } from '@mui/material';
import type { TooltipState } from 'component/insights/components/LineChart/ChartTooltip/ChartTooltip';
import { ChartTooltipContainer } from 'component/insights/components/LineChart/ChartTooltip/ChartTooltip';
import { getFlagTypeColors } from './flagTypeColors.ts';

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

    // Filter for created flag type datasets only
    const createdFlagDataPoints = tooltip.dataPoints.filter((point) =>
        point.dataset.label?.startsWith('Created:'),
    );

    if (createdFlagDataPoints.length === 0) {
        return null;
    }

    // Get the data from the first point (they all have the same raw data)
    const rawData = createdFlagDataPoints[0]?.raw as any;

    if (!rawData?.createdFlagsByType) {
        return null;
    }

    // Get flag type names from the chart datasets
    const flagTypeNames = createdFlagDataPoints.map(
        (point) => point.dataset.label?.replace('Created: ', '') || '',
    );

    const flagTypeColors = getFlagTypeColors(theme);

    // Create entries for each flag type with count > 0
    const flagTypeEntries = Object.entries(rawData.createdFlagsByType)
        .filter(([, count]) => (count as number) > 0)
        .map(([flagType, count], index) => ({
            type: flagType,
            count: count as number,
            color:
                flagTypeColors[flagTypeNames.indexOf(flagType)] ||
                flagTypeColors[index % flagTypeColors.length],
        }));

    if (flagTypeEntries.length === 0) {
        return null;
    }

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

                {flagTypeEntries.map(({ type, count, color }) => (
                    <StyledFlagTypeItem key={type}>
                        <Typography variant='body2' component='span'>
                            <Typography sx={{ color }} component='span'>
                                {'● '}
                            </Typography>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Typography>
                        <Typography variant='body2' component='span'>
                            {count}
                        </Typography>
                    </StyledFlagTypeItem>
                ))}
            </StyledTooltipItemContainer>
        </ChartTooltipContainer>
    );
};
