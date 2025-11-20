import type { FC } from 'react';
import { Box, Typography, styled, Paper } from '@mui/material';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import { ImpactMetricsChart } from './ImpactMetricsChart.tsx';
import type { ChartConfig, DisplayChartConfig } from './types.ts';
import PermissionIconButton from '../common/PermissionIconButton/PermissionIconButton.tsx';
import { ADMIN } from '../providers/AccessProvider/permissions.ts';

export interface ChartItemProps {
    config: DisplayChartConfig;
    onEdit: (config: ChartConfig) => void;
    onDelete: (id: string) => void;
    permission?: string;
    projectId?: string;
    dragHandle?: React.ReactNode;
}

const getConfigDescription = (config: DisplayChartConfig): string => {
    const parts: string[] = [];

    if (config.displayName) {
        parts.push(`${config.displayName}`);
    }

    parts.push(`last ${config.timeRange}`);

    parts.push(config.aggregationMode);

    const labelCount = Object.keys(config.labelSelectors).length;
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

export const ChartItem: FC<ChartItemProps> = ({
    config,
    onEdit,
    onDelete,
    permission = ADMIN,
    projectId,
    dragHandle,
}) => (
    <StyledWidget>
        <StyledHeader>
            {dragHandle}
            <StyledChartTitle>
                {config.title && (
                    <Typography variant='h6'>{config.title}</Typography>
                )}
                <Typography variant='body2' color='text.secondary'>
                    {getConfigDescription(config)}
                </Typography>
            </StyledChartTitle>
            {config.mode !== 'read' && (
                <StyledChartActions>
                    <PermissionIconButton
                        onClick={() => onEdit(config)}
                        permission={permission}
                        projectId={projectId}
                    >
                        <Edit />
                    </PermissionIconButton>
                    <PermissionIconButton
                        onClick={() => onDelete(config.id)}
                        permission={permission}
                        projectId={projectId}
                    >
                        <Delete />
                    </PermissionIconButton>
                </StyledChartActions>
            )}
        </StyledHeader>

        <StyledChartContent>
            <StyledImpactChartContainer>
                <ImpactMetricsChart
                    metricName={config.metricName}
                    timeRange={config.timeRange}
                    labelSelectors={config.labelSelectors}
                    yAxisMin={config.yAxisMin}
                    aggregationMode={config.aggregationMode}
                    aspectRatio={1.5}
                    overrideOptions={{ maintainAspectRatio: false }}
                    emptyDataDescription='Send impact metrics using Unleash SDK for this series to view the chart.'
                />
            </StyledImpactChartContainer>
        </StyledChartContent>
    </StyledWidget>
);
