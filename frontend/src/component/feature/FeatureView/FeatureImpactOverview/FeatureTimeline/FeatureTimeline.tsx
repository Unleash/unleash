import { type FC, useMemo } from 'react';
import { styled, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { useEventSearch } from 'hooks/api/getters/useEventSearch/useEventSearch';
import type { EventSchema, EventSchemaType } from 'openapi';
import { startOfDay, sub } from 'date-fns';
import { FeatureTimelineEventGroup } from './FeatureTimelineEventGroup';
import type { TimeRange } from '../FeatureImpactOverview';

export type FeatureTimelineEvent = {
    id: number;
    timestamp: number;
    type: EventSchemaType;
    label: string;
    summary: string;
    environment?: string;
};

export type FeatureTimelineEventGroupType = FeatureTimelineEvent[];

const StyledContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(2, 3),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
    border: `1px solid ${theme.palette.divider}`,
}));

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
}));

const StyledTitle = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.text.primary,
}));

const StyledEventCount = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(1),
}));

const StyledTimelineBody = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(1.5, 0),
}));

const StyledTimelineContainer = styled('div')(({ theme }) => ({
    position: 'relative',
    height: theme.spacing(1),
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1.5, 0),
}));

const StyledTimeline = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.divider,
    height: theme.spacing(0.5),
    width: '100%',
}));

const StyledMarker = styled('div')(({ theme }) => ({
    position: 'absolute',
    height: theme.spacing(1),
    width: theme.spacing(0.25),
    backgroundColor: theme.palette.text.secondary,
}));

const StyledStart = styled(StyledMarker)({
    left: 0,
});

const StyledEnd = styled(StyledMarker)({
    right: 0,
});

const StyledRow = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
});

const StyledMarkerLabel = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

const StyledMiddleMarkerContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
});

const StyledMiddleMarker = styled(StyledMarker)(({ theme }) => ({
    top: theme.spacing(-2),
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
    padding: theme.spacing(0.5, 1.5),
    fontSize: theme.fontSizes.smallBody,
    textTransform: 'none',
}));

const RELEVANT_EVENT_TYPES: EventSchemaType[] = [
    'strategy-reactivated',
    'strategy-updated',
    'feature-created',
    'feature-updated',
    'feature-variants-updated',
    'feature-strategy-update',
    'feature-strategy-add',
    'feature-strategy-remove',
    'feature-environment-enabled',
    'feature-environment-disabled',
    'release-plan-added',
    'release-plan-removed',
    'release-plan-milestone-started',
];

const TIME_RANGE_CONFIG: Record<
    TimeRange,
    { value: Duration; markers: string[] }
> = {
    hour: {
        value: { hours: 1 },
        markers: ['-1h', '-30m', 'now'],
    },
    day: {
        value: { days: 1 },
        markers: ['-24h', '-12h', 'now'],
    },
    week: {
        value: { weeks: 1 },
        markers: ['-7d', '-3d', 'now'],
    },
    month: {
        value: { months: 1 },
        markers: ['-30d', '-15d', 'now'],
    },
};

const toISODateString = (date: Date) => date.toISOString().split('T')[0];

interface FeatureTimelineProps {
    featureName: string;
    projectId: string;
    timeRange: TimeRange;
    onTimeRangeChange: (range: TimeRange) => void;
    onEventClick?: (event: FeatureTimelineEvent) => void;
}

export const FeatureTimeline: FC<FeatureTimelineProps> = ({
    featureName,
    projectId,
    timeRange,
    onTimeRangeChange,
    onEventClick,
}) => {
    const config = TIME_RANGE_CONFIG[timeRange];
    const endDate = new Date();
    const startDate = sub(endDate, config.value);
    const endTime = endDate.getTime();
    const startTime = startDate.getTime();

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
        return rawEvents
            .map((event: EventSchema) => {
                const timestamp = new Date(event.createdAt).getTime();
                if (timestamp < startTime || timestamp > endTime) {
                    return null;
                }
                return {
                    id: event.id,
                    timestamp,
                    type: event.type,
                    label: event.label || event.type,
                    summary:
                        event.summary ||
                        `**${event.createdBy}** triggered **${event.type}**`,
                    environment: event.environment,
                };
            })
            .filter(Boolean) as FeatureTimelineEvent[];
    }, [rawEvents, startTime, endTime]);

    const timespanInMs = endTime - startTime;
    const groupingThresholdInMs = useMemo(
        () => timespanInMs * 0.02,
        [timespanInMs],
    );

    const groups = useMemo(
        () =>
            events.reduce(
                (groups: FeatureTimelineEventGroupType[], event) => {
                    if (groups.length === 0) {
                        groups.push([event]);
                    } else {
                        const lastGroup = groups[groups.length - 1];
                        const lastEventInGroup =
                            lastGroup[lastGroup.length - 1];

                        if (
                            event.timestamp - lastEventInGroup.timestamp <=
                            groupingThresholdInMs
                        ) {
                            lastGroup.push(event);
                        } else {
                            groups.push([event]);
                        }
                    }
                    return groups;
                },
                [],
            ),
        [events, groupingThresholdInMs],
    );

    const handleTimeRangeChange = (
        _: React.MouseEvent<HTMLElement>,
        newRange: TimeRange | null,
    ) => {
        if (newRange) {
            onTimeRangeChange(newRange);
        }
    };

    return (
        <StyledContainer>
            <StyledHeader>
                <div>
                    <StyledTitle>Feature Events</StyledTitle>
                    <StyledEventCount>({events.length} events)</StyledEventCount>
                </div>
                <ToggleButtonGroup
                    size='small'
                    value={timeRange}
                    exclusive
                    onChange={handleTimeRangeChange}
                >
                    <StyledToggleButton value='hour'>Hour</StyledToggleButton>
                    <StyledToggleButton value='day'>Day</StyledToggleButton>
                    <StyledToggleButton value='week'>Week</StyledToggleButton>
                    <StyledToggleButton value='month'>Month</StyledToggleButton>
                </ToggleButtonGroup>
            </StyledHeader>
            <StyledTimelineBody>
                <StyledTimelineContainer>
                    <StyledTimeline />
                    <StyledStart />
                    {groups.map((group) => (
                        <FeatureTimelineEventGroup
                            key={group[0].id}
                            group={group}
                            startTime={startTime}
                            endTime={endTime}
                            onClick={onEventClick}
                        />
                    ))}
                    <StyledEnd />
                </StyledTimelineContainer>
                <StyledRow>
                    <StyledMarkerLabel>{config.markers[0]}</StyledMarkerLabel>
                    {config.markers.slice(1, -1).map((marker) => (
                        <StyledMiddleMarkerContainer key={marker}>
                            <StyledMiddleMarker />
                            <StyledMarkerLabel>{marker}</StyledMarkerLabel>
                        </StyledMiddleMarkerContainer>
                    ))}
                    <StyledMarkerLabel>
                        {config.markers[config.markers.length - 1]}
                    </StyledMarkerLabel>
                </StyledRow>
            </StyledTimelineBody>
        </StyledContainer>
    );
};

export { RELEVANT_EVENT_TYPES };
