import { styled } from '@mui/material';
import type { EventSchema, EventSchemaType } from 'openapi';
import { startOfDay, sub } from 'date-fns';
import { useEventSearch } from 'hooks/api/getters/useEventSearch/useEventSearch';
import { EventTimelineEventGroup } from './EventTimelineEventGroup/EventTimelineEventGroup.tsx';
import { EventTimelineHeader } from './EventTimelineHeader/EventTimelineHeader.tsx';
import { useMemo } from 'react';
import { useSignalQuery } from 'hooks/api/getters/useSignalQuery/useSignalQuery';
import type { ISignalQuerySignal } from 'interfaces/signal';
import type { IEnvironment } from 'interfaces/environments';
import { useEventTimelineContext } from './EventTimelineContext.tsx';

export type TimelineEventType = 'signal' | EventSchemaType;

type RawTimelineEvent = EventSchema | ISignalQuerySignal;

export type TimelineEvent = {
    id: number;
    timestamp: number;
    type: TimelineEventType;
    label: string;
    summary: string;
    icon?: string;
    variant?: string;
};

export type TimelineEventGroup = TimelineEvent[];

const StyledRow = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
});

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

const StyledMiddleMarkerContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
});

const StyledMarker = styled('div')(({ theme }) => ({
    position: 'absolute',
    height: theme.spacing(1),
    width: theme.spacing(0.25),
    backgroundColor: theme.palette.text.secondary,
}));

const StyledMiddleMarker = styled(StyledMarker)(({ theme }) => ({
    top: theme.spacing(-2),
}));

const StyledMarkerLabel = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

const StyledStart = styled(StyledMarker)({
    left: 0,
});

const StyledEnd = styled(StyledMarker)({
    right: 0,
});

const RELEVANT_EVENT_TYPES: EventSchemaType[] = [
    'strategy-reactivated',
    'strategy-updated',
    'segment-updated',
    'segment-deleted',
    'feature-created',
    'feature-updated',
    'feature-variants-updated',
    'feature-archived',
    'feature-revived',
    'feature-strategy-update',
    'feature-strategy-add',
    'feature-strategy-remove',
    'feature-environment-enabled',
    'feature-environment-disabled',
    'release-plan-added',
    'release-plan-removed',
    'release-plan-milestone-started',
];

const toISODateString = (date: Date) => date.toISOString().split('T')[0];

const isSignal = (event: RawTimelineEvent): event is ISignalQuerySignal =>
    'sourceId' in event;

const getTimestamp = (event: RawTimelineEvent) => {
    return new Date(event.createdAt).getTime();
};

const isInRange = (timestamp: number, startTime: number, endTime: number) =>
    timestamp >= startTime && timestamp <= endTime;

const isValidString = (str: unknown): str is string =>
    typeof str === 'string' && str.trim().length > 0;

const getTimelineEvent = (
    event: RawTimelineEvent,
    timestamp: number,
    environment?: IEnvironment,
): TimelineEvent | undefined => {
    if (isSignal(event)) {
        const {
            id,
            sourceName = 'unknown source',
            sourceDescription,
            tokenName,
            payload: {
                unleashTitle,
                unleashDescription,
                unleashIcon,
                unleashVariant,
            },
        } = event;

        const title = unleashTitle || sourceName;
        const label = `Signal: ${title}`;
        const summary = unleashDescription
            ? `Signal: **[${title}](/integrations/signals)** ${unleashDescription}`
            : `Signal originated from **[${sourceName} (${tokenName})](/integrations/signals)** endpoint${sourceDescription ? `: ${sourceDescription}` : ''}`;

        return {
            id,
            timestamp,
            type: 'signal',
            label,
            summary,
            ...(isValidString(unleashIcon) ? { icon: unleashIcon } : {}),
            ...(isValidString(unleashVariant)
                ? { variant: unleashVariant }
                : {}),
        };
    }

    if (
        !event.environment ||
        !environment ||
        event.environment === environment.name
    ) {
        const {
            id,
            type,
            label: eventLabel,
            summary: eventSummary,
            createdBy,
        } = event;

        const label = eventLabel || type;
        const summary =
            eventSummary || `**${createdBy}** triggered **${type}**`;

        return { id, timestamp, type, label, summary };
    }
};

export const EventTimeline = () => {
    const { timeSpan, environment } = useEventTimelineContext();
    const endDate = new Date();
    const startDate = sub(endDate, timeSpan.value);
    const endTime = endDate.getTime();
    const startTime = startDate.getTime();

    const { events: baseEvents } = useEventSearch(
        {
            from: `IS:${toISODateString(startOfDay(startDate))}`,
            to: `IS:${toISODateString(endDate)}`,
            type: `IS_ANY_OF:${RELEVANT_EVENT_TYPES.join(',')}`,
        },
        { refreshInterval: 10 * 1000 },
    );
    const { signals: baseSignals } = useSignalQuery(
        {
            from: `IS:${toISODateString(startOfDay(startDate))}`,
            to: `IS:${toISODateString(endDate)}`,
        },
        { refreshInterval: 10 * 1000 },
    );

    const events = useMemo(
        () =>
            [...baseEvents, ...baseSignals]
                .reduce<TimelineEvent[]>((acc, event) => {
                    const timestamp = getTimestamp(event);
                    if (isInRange(timestamp, startTime, endTime)) {
                        const timelineEvent = getTimelineEvent(
                            event,
                            timestamp,
                            environment,
                        );
                        if (timelineEvent) {
                            acc.push(timelineEvent);
                        }
                    }
                    return acc;
                }, [])
                .sort((a, b) => a.timestamp - b.timestamp),
        [baseEvents, baseSignals, startTime, endTime, environment],
    );

    const timespanInMs = endTime - startTime;
    const groupingThresholdInMs = useMemo(
        () => timespanInMs * 0.02,
        [timespanInMs],
    );

    const groups = useMemo(
        () =>
            events.reduce((groups: TimelineEventGroup[], event) => {
                if (groups.length === 0) {
                    groups.push([event]);
                } else {
                    const lastGroup = groups[groups.length - 1];
                    const lastEventInGroup = lastGroup[lastGroup.length - 1];

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
            }, []),
        [events, groupingThresholdInMs],
    );

    return (
        <>
            <StyledRow>
                <EventTimelineHeader totalEvents={events.length} />
            </StyledRow>
            <StyledTimelineBody>
                <StyledTimelineContainer>
                    <StyledTimeline />
                    <StyledStart />
                    {groups.map((group) => (
                        <EventTimelineEventGroup
                            key={group[0].id}
                            group={group}
                            startTime={startTime}
                            endTime={endTime}
                        />
                    ))}
                    <StyledEnd />
                </StyledTimelineContainer>
                <StyledRow>
                    <StyledMarkerLabel>{timeSpan.markers[0]}</StyledMarkerLabel>
                    {timeSpan.markers.slice(1).map((marker) => (
                        <StyledMiddleMarkerContainer key={marker}>
                            <StyledMiddleMarker />
                            <StyledMarkerLabel>{marker}</StyledMarkerLabel>
                        </StyledMiddleMarkerContainer>
                    ))}
                    <StyledMarkerLabel>now</StyledMarkerLabel>
                </StyledRow>
            </StyledTimelineBody>
        </>
    );
};
