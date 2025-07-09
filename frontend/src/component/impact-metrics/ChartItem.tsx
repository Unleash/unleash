import type { FC } from 'react';
import { Box, Typography, IconButton, styled, Paper } from '@mui/material';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import DragHandle from '@mui/icons-material/DragHandle';
import { ImpactMetricsChart } from './ImpactMetricsChart.tsx';
import type { ChartConfig } from './types.ts';

export interface ChartItemProps {
    config: ChartConfig;
    onEdit: (config: ChartConfig) => void;
    onDelete: (id: string) => void;
}

const getConfigDescription = (config: ChartConfig): string => {
    const parts: string[] = [];

    if (config.selectedSeries) {
        parts.push(`${config.selectedSeries}`);
    }

    parts.push(`last ${config.selectedRange}`);

    if (config.showRate) {
        parts.push('rate per second');
    }

    const labelCount = Object.keys(config.selectedLabels).length;
    if (labelCount > 0) {
        parts.push(`${labelCount} filter${labelCount > 1 ? 's' : ''}`);
    }

    return parts.join(' • ');
};

const StyledWidget = styled(Paper)(({ theme }) => ({
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const StyledChartContent = styled(Box)({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
});

const StyledImpactChartContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    minWidth: 0,
    flexGrow: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto 0',
    padding: theme.spacing(3),
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledDragHandle = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    cursor: 'move',
    padding: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.text.secondary,
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        color: theme.palette.text.primary,
    },
}));

const StyledChartTitle = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    flexGrow: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
}));

const StyledChartActions = styled(Box)(({ theme }) => ({
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

export const ChartItem: FC<ChartItemProps> = ({ config, onEdit, onDelete }) => (
    <StyledWidget>
        <StyledHeader>
            <StyledDragHandle className='grid-item-drag-handle'>
                <DragHandle fontSize='small' />
            </StyledDragHandle>
            <StyledChartTitle>
                {config.title && (
                    <Typography variant='h6'>{config.title}</Typography>
                )}
                <Typography variant='body2' color='text.secondary'>
                    {getConfigDescription(config)}
                </Typography>
            </StyledChartTitle>
            <StyledChartActions>
                <IconButton onClick={() => onEdit(config)}>
                    <Edit />
                </IconButton>
                <IconButton onClick={() => onDelete(config.id)}>
                    <Delete />
                </IconButton>
            </StyledChartActions>
        </StyledHeader>

        <StyledChartContent>
            <StyledImpactChartContainer>
                <ImpactMetricsChart
                    selectedSeries={config.selectedSeries}
                    selectedRange={config.selectedRange}
                    selectedLabels={config.selectedLabels}
                    beginAtZero={config.beginAtZero}
                    showRate={config.showRate}
                    aspectRatio={1.5}
                    overrideOptions={{ maintainAspectRatio: false }}
                    emptyDataDescription='Send impact metrics using Unleash SDK for this series to view the chart.'
                />
            </StyledImpactChartContainer>
        </StyledChartContent>
    </StyledWidget>
);
