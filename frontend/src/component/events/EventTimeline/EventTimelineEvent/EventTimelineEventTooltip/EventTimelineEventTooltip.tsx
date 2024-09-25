import { styled } from '@mui/material';
import { Markdown } from 'component/common/Markdown/Markdown';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMDHMS } from 'utils/formatDate';
import type { TimelineEvent, TimelineEventGroup } from '../../EventTimeline';
import { isSignal } from '../EventTimelineEvent';
import { EventTimelineEventTooltipGroupItem } from './EventTimelineEventTooltipGroupItem';

const StyledTooltipHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
    gap: theme.spacing(2),
    flexWrap: 'wrap',
}));

const StyledTooltipTitle = styled('div')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSizes.smallBody,
    wordBreak: 'break-word',
    flex: 1,
}));

const StyledDateTime = styled('div')(({ theme }) => ({
    color: theme.palette.text.secondary,
    whiteSpace: 'nowrap',
}));

interface IEventTimelineEventTooltipProps {
    event: TimelineEvent | TimelineEventGroup;
}

export const EventTimelineEventTooltip = ({
    event,
}: IEventTimelineEventTooltipProps) => {
    const { locationSettings } = useLocationSettings();
    if (Array.isArray(event)) {
        const firstEvent = Array.isArray(event)
            ? event[event.length - 1]
            : event;
        const eventDateTime = formatDateYMDHMS(
            firstEvent.createdAt,
            locationSettings?.locale,
        );
        return (
            <>
                <StyledTooltipHeader>
                    <StyledTooltipTitle>
                        {event.length} events occured
                    </StyledTooltipTitle>
                    <StyledDateTime>{eventDateTime}</StyledDateTime>
                </StyledTooltipHeader>
                {event.map((e) => (
                    <EventTimelineEventTooltipGroupItem key={e.id} event={e} />
                ))}
            </>
        );
    }
    const eventDateTime = formatDateYMDHMS(
        event.createdAt,
        locationSettings?.locale,
    );

    return (
        <>
            <StyledTooltipHeader>
                <StyledTooltipTitle>
                    {isSignal(event) ? '' : event.label}
                </StyledTooltipTitle>
                <StyledDateTime>{eventDateTime}</StyledDateTime>
            </StyledTooltipHeader>
            <Markdown>{isSignal(event) ? '' : event.summary}</Markdown>
        </>
    );
};
