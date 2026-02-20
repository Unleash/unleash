import { type FC, useMemo } from 'react';
import { Box, Paper, styled, Typography } from '@mui/material';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import { ImpactMetricsChart } from 'component/impact-metrics/ImpactMetricsChart';
import type { DisplayChartConfig, ChartConfig } from 'component/impact-metrics/types';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { useEventSearch } from 'hooks/api/getters/useEventSearch/useEventSearch';
import { startOfDay, sub } from 'date-fns';
import type { TimeRange } from '../FeatureImpactOverview';
import {
    RELEVANT_EVENT_TYPES,
    type FeatureTimelineEvent,
} from '../FeatureTimeline/FeatureTimeline';

const StyledWidget = styled(Paper)(({ theme }) => ({
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 320,
    border: `1px solid ${theme.palette.divider}`,
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
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

const StyledChartContent = styled(Box)({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    position: 'relative',
});

const StyledImpactChartContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    minWidth: 0,
    flexGrow: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto 0',
    padding: theme.spacing(2),
}));

const StyledEventMarkersContainer = styled('div')({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
});

const TIME_RANGE_CONFIG: Record<TimeRange, { value: Duration }> = {
    hour: { value: { hours: 1 } },
    day: { value: { days: 1 } },
    week: { value: { weeks: 1 } },
    month: { value: { months: 1 } },
};

const toISODateString = (date: Date) => date.toISOString().split('T')[0];

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

interface ImpactChartWithEventsProps {
    config: DisplayChartConfig;
    featureName: string;
    projectId: string;
    timeRange: TimeRange;
    onEdit: () => void;
    onDelete: () => void;
}

export const ImpactChartWithEvents: FC<ImpactChartWithEventsProps> = ({
    config,
    featureName,
    projectId,
    timeRange,
    onEdit,
    onDelete,
}) => {
    // Use the chart's own time range, not the global one
    const chartTimeRange = config.timeRange;
    const rangeConfig = TIME_RANGE_CONFIG[chartTimeRange];
    const endDate = new Date();
    const startDate = sub(endDate, rangeConfig.value);

    const { events: rawEvents } = useEventSearch(
        {
            feature: `IS:${featureName}`,
            project: `IS:${projectId}`,
            from: `IS:${toISODateString(startOfDay(startDate))}`,
            to: `IS:${toISODateString(endDate)}`,
            type: `IS_ANY_OF:${RELEVANT_EVENT_TYPES.join(',')}`,
        },
        { refreshInterval: 30 * 1000 },
    );

    const events: FeatureTimelineEvent[] = useMemo(() => {
        const startTime = startDate.getTime();
        const endTime = endDate.getTime();
        return rawEvents
            .map((event) => {
                const timestamp = new Date(event.createdAt).getTime();
                if (timestamp < startTime || timestamp > endTime) {
                    return null;
                }
                return {
                    id: event.id,
                    timestamp,
                    type: event.type,
                    label: event.label || event.type,
                    summary: event.summary || `${event.type}`,
                    environment: event.environment,
                };
            })
            .filter(Boolean) as FeatureTimelineEvent[];
    }, [rawEvents, startDate, endDate]);

    // Build Chart.js annotation plugin config for event markers
    const eventAnnotations = useMemo(() => {
        if (events.length === 0) return {};

        const annotations: Record<string, unknown> = {};
        events.forEach((event, index) => {
            const eventColor = event.type.includes('enabled')
                ? 'rgba(46, 125, 50, 0.7)'
                : event.type.includes('disabled')
                  ? 'rgba(211, 47, 47, 0.7)'
                  : event.type.includes('strategy')
                    ? 'rgba(25, 118, 210, 0.7)'
                    : 'rgba(156, 39, 176, 0.7)';

            annotations[`event-${index}`] = {
                type: 'line',
                xMin: event.timestamp,
                xMax: event.timestamp,
                borderColor: eventColor,
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                    display: true,
                    content: '',
                    position: 'start',
                },
            };
        });

        return {
            plugins: {
                annotation: {
                    annotations,
                },
            },
        };
    }, [events]);

    const isReadOnly = config.mode === 'read';

    return (
        <StyledWidget>
            <StyledHeader>
                <StyledChartTitle>
                    {config.title && (
                        <Typography variant='h3'>{config.title}</Typography>
                    )}
                    <Typography variant='body2' color='text.secondary'>
                        {getConfigDescription(config)}
                        {events.length > 0 && ` • ${events.length} events`}
                    </Typography>
                </StyledChartTitle>
                {!isReadOnly && (
                    <StyledChartActions>
                        <PermissionIconButton
                            onClick={onEdit}
                            permission={UPDATE_FEATURE}
                            projectId={projectId}
                            tooltipProps={{ title: 'Edit chart' }}
                        >
                            <Edit />
                        </PermissionIconButton>
                        <PermissionIconButton
                            onClick={onDelete}
                            permission={UPDATE_FEATURE}
                            projectId={projectId}
                            tooltipProps={{ title: 'Remove chart' }}
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
                        overrideOptions={{
                            maintainAspectRatio: false,
                            ...eventAnnotations,
                        }}
                        emptyDataDescription='Send impact metrics using Unleash SDK for this series to view the chart.'
                    />
                </StyledImpactChartContainer>
            </StyledChartContent>
        </StyledWidget>
    );
};
