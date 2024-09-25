import { styled } from '@mui/material';
import type { EventSchema, EventSchemaType } from 'openapi';
import { useState } from 'react';
import { startOfDay, sub } from 'date-fns';
import type { IEnvironment } from 'interfaces/environments';
import { useEventSearch } from 'hooks/api/getters/useEventSearch/useEventSearch';
import { EventTimelineEvent } from './EventTimelineEvent/EventTimelineEvent';
import {
    EventTimelineHeader,
    type TimeSpanOption,
    timeSpanOptions,
} from './EventTimelineHeader/EventTimelineHeader';
import type { ISignal } from 'interfaces/signal';

export type EnrichedEvent = EventSchema & {
    label: string;
    summary: string;
};

export type TimelineEvent = EnrichedEvent | ISignal;

export type TimelineEventGroup = TimelineEvent[];

const StyledRow = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
});

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
];

const toISODateString = (date: Date) => date.toISOString().split('T')[0];
const TIME_GROUPING_SIZE = 2;

export const EventTimeline = () => {
    const [timeSpan, setTimeSpan] = useState<TimeSpanOption>(
        timeSpanOptions[0],
    );
    const [environment, setEnvironment] = useState<IEnvironment | undefined>();

    const endDate = new Date();
    const startDate = sub(endDate, timeSpan.value);
    const timelineDuration = endDate.getTime() - startDate.getTime();
    const timeGroups = 100 / TIME_GROUPING_SIZE;
    const groups = new Array(timeGroups).fill(0).map((_, i) => {
        const from = i * TIME_GROUPING_SIZE;
        const to = from + TIME_GROUPING_SIZE;
        const position = from + TIME_GROUPING_SIZE / 2;
        return {
            from,
            to,
            position,
            events: [] as { position: number; event: EnrichedEvent }[],
        };
    });

    const { events: baseEvents } = useEventSearch(
        {
            from: `IS:${toISODateString(startOfDay(startDate))}`,
            to: `IS:${toISODateString(endDate)}`,
            type: `IS_ANY_OF:${RELEVANT_EVENT_TYPES.join(',')}`,
        },
        { refreshInterval: 10 * 1000 },
    );

    const events = baseEvents as EnrichedEvent[];

    const filteredEvents = events.filter(
        (event) =>
            new Date(event.createdAt).getTime() >= startDate.getTime() &&
            new Date(event.createdAt).getTime() <= endDate.getTime() &&
            RELEVANT_EVENT_TYPES.includes(event.type) &&
            (!event.environment ||
                !environment ||
                event.environment === environment.name),
    );

    filteredEvents.forEach((event) => {
        const eventTime = new Date(event.createdAt).getTime();
        const position =
            ((eventTime - startDate.getTime()) / timelineDuration) * 100;
        const grp = groups.find(
            (group) => group && group.from <= position && group.to > position,
        );
        grp?.events.push({ position, event });
    });

    const mappedEvents = groups
        .filter((group) => group.events.length > 0)
        .map((group) => {
            return group.events.length === 1
                ? {
                      id: group.events[0].event.id,
                      position: group.events[0].position,
                      event: group.events[0].event,
                  }
                : {
                      position: group.position,
                      id: group.events[0].event.id,
                      events: group.events.map(
                          (ev) => ev.event,
                      ) as TimelineEventGroup,
                  };
        });

    const sortedEvents = [...mappedEvents].reverse();

    return (
        <>
            <StyledRow>
                <EventTimelineHeader
                    totalEvents={sortedEvents.length}
                    timeSpan={timeSpan}
                    setTimeSpan={setTimeSpan}
                    environment={environment}
                    setEnvironment={setEnvironment}
                />
            </StyledRow>
            <StyledTimelineContainer>
                <StyledTimeline />
                <StyledStart />
                {sortedEvents.map((entry) => (
                    <EventTimelineEvent
                        key={entry.id}
                        event={entry.event ?? entry.events}
                        position={`${entry.position}%`}
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
        </>
    );
};
