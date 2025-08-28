import type { FC } from 'react';
import { Paper, Typography, styled } from '@mui/material';
import type { TooltipState } from 'component/insights/components/LineChart/ChartTooltip/ChartTooltip';
import type { WeekData } from './types.ts';

const StyledTooltipItemContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    width: 200,
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
    '::before': {
        content: '" "',
        display: 'inline-block',
        height: '.65rem',
        aspectRatio: '1/1',
        borderRadius: '50%',

        backgroundColor:
            dataType === 'archived'
                ? theme.palette.charts.A2
                : theme.palette.charts.A1,
    },
}));

interface CreationArchiveRatioTooltipProps {
    tooltip: TooltipState | null;
}

export const CreationArchiveRatioTooltip: FC<
    CreationArchiveRatioTooltipProps
> = ({ tooltip }) => {
    if (!tooltip?.dataPoints) {
        return null;
    }

    const rawData = tooltip.dataPoints[0].raw as WeekData;
    const archivedCount = rawData.archivedFlags || 0;
    const createdCount = rawData.totalCreatedFlags || 0;
    const ratio = Math.round((archivedCount / createdCount) * 100);

    return (
        <StyledTooltipItemContainer elevation={3}>
            <Typography
                variant='body2'
                component='div'
                fontWeight='bold'
                sx={{ marginBottom: 1 }}
            >
                Ratio {ratio}%
            </Typography>

            <DataList>
                <DataRow dataType='archived'>
                    <dt>Flags archived</dt>
                    <dd>{archivedCount}</dd>
                </DataRow>
                <DataRow dataType='created'>
                    <dt>Flags created</dt>
                    <dd>{createdCount}</dd>
                </DataRow>
            </DataList>
        </StyledTooltipItemContainer>
    );
};
