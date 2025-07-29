import type { FC } from 'react';
import { Box, Paper, Typography, styled, useTheme } from '@mui/material';
import type { TooltipState } from 'component/insights/components/LineChart/ChartTooltip/ChartTooltip';
import { ChartTooltipContainer } from 'component/insights/components/LineChart/ChartTooltip/ChartTooltip';

const getRatioTooltipColors = (theme: any) => ({
    CREATED: theme.palette.success.main,
    ARCHIVED: theme.palette.background.application,
});

const StyledTooltipItemContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    width: 200,
}));

const StyledFlagItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(0.5),
}));

interface CreationArchiveRatioTooltipProps {
    tooltip: TooltipState | null;
}

export const CreationArchiveRatioTooltip: FC<
    CreationArchiveRatioTooltipProps
> = ({ tooltip }) => {
    const theme = useTheme();
    const colors = getRatioTooltipColors(theme);

    if (!tooltip?.dataPoints) {
        return null;
    }

    // Filter for the percentage line dataset
    const ratioDataPoint = tooltip.dataPoints.find(
        (point) => point.dataset.label === 'Flags archived / Flags created',
    );

    if (!ratioDataPoint) {
        return null;
    }

    // Get the raw data to extract counts
    const rawData = ratioDataPoint.raw as any;

    if (!rawData) {
        return null;
    }

    const archivedCount = rawData.archivedFlags || 0;
    const createdCount = rawData.totalCreatedFlags || 0;
    const ratio = Math.round(ratioDataPoint.parsed.y as number);

    return (
        <ChartTooltipContainer tooltip={tooltip}>
            <StyledTooltipItemContainer elevation={3}>
                <Typography
                    variant='body2'
                    component='div'
                    fontWeight='bold'
                    sx={{ marginBottom: 1 }}
                >
                    Ratio {ratio}%
                </Typography>

                <StyledFlagItem>
                    <Typography variant='body2' component='span'>
                        <Typography
                            sx={{ color: colors.CREATED }}
                            component='span'
                        >
                            {'● '}
                        </Typography>
                        Flags created
                    </Typography>
                    <Typography variant='body2' component='span'>
                        {createdCount}
                    </Typography>
                </StyledFlagItem>

                <StyledFlagItem>
                    <Typography variant='body2' component='span'>
                        <Typography
                            sx={{ color: colors.ARCHIVED }}
                            component='span'
                        >
                            {'● '}
                        </Typography>
                        Flags archived
                    </Typography>
                    <Typography variant='body2' component='span'>
                        {archivedCount}
                    </Typography>
                </StyledFlagItem>
            </StyledTooltipItemContainer>
        </ChartTooltipContainer>
    );
};
