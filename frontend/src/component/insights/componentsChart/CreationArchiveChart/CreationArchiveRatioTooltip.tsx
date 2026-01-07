import type { FC } from 'react';
import { Paper, Typography, styled } from '@mui/material';
import type { TooltipState } from 'component/insights/components/LineChart/ChartTooltip/ChartTooltip';
import { ChartTooltipContainer } from 'component/insights/components/LineChart/ChartTooltip/ChartTooltip';
import type { FinalizedWeekData } from './types.ts';
import { calculateRatio } from 'component/insights/calculate-ratio/calculate-ratio.ts';

const StyledTooltipItemContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1.5),
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(0.5),
}));

const DataList = styled('dl')(({ theme }) => ({
    margin: 0,
}));

const DataRow = styled('div', {
    shouldForwardProp: (prop) => prop !== 'dataType',
})<{ dataType: 'archived' | 'created' }>(({ theme, dataType }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    fontSize: theme.typography.body2.fontSize,
    'dt::before': {
        content: '" "',
        display: 'inline-block',
        height: '.65rem',
        aspectRatio: '1/1',
        borderRadius: '50%',
        marginInlineEnd: theme.spacing(0.5),

        backgroundColor:
            dataType === 'archived'
                ? theme.palette.charts.A2
                : theme.palette.charts.A1,
    },
}));

interface CreationArchiveRatioTooltipProps {
    tooltip: TooltipState | null;
}

const Timestamp = styled('span')(({ theme }) => ({
    whiteSpace: 'nowrap',
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
}));

export const CreationArchiveRatioTooltip: FC<
    CreationArchiveRatioTooltipProps
> = ({ tooltip }) => {
    if (!tooltip?.dataPoints) {
        return null;
    }

    const rawData = tooltip.dataPoints[0].raw as FinalizedWeekData;
    const { archivedFlags, totalCreatedFlags } =
        rawData.state === 'withRatio'
            ? rawData
            : { archivedFlags: 0, totalCreatedFlags: 0 };

    const ratio = calculateRatio(archivedFlags, totalCreatedFlags);

    return (
        <ChartTooltipContainer tooltip={tooltip}>
            <StyledTooltipItemContainer elevation={3}>
                <Typography variant='body2' component='span' fontWeight='bold'>
                    Ratio {ratio}
                </Typography>

                <DataList>
                    <DataRow dataType='archived'>
                        <dt>Flags archived</dt>
                        <dd>{archivedFlags}</dd>
                    </DataRow>
                    <DataRow dataType='created'>
                        <dt>Flags created</dt>
                        <dd>{totalCreatedFlags}</dd>
                    </DataRow>
                </DataList>
                <Timestamp>{tooltip.title}</Timestamp>
            </StyledTooltipItemContainer>
        </ChartTooltipContainer>
    );
};
