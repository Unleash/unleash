import { Badge, styled } from '@mui/material';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { EventTimelineEventTooltip } from './EventTimelineEventTooltip/EventTimelineEventTooltip';
import type { TimelineEventGroup } from '../EventTimeline';
import { EventTimelineEventCircle } from './EventTimelineEventCircle';

const StyledEvent = styled('div', {
    shouldForwardProp: (prop) => prop !== 'position',
})<{ position: string }>(({ position }) => ({
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    left: position,
    transform: 'translateX(-50%)',
    zIndex: 1,
}));

interface IEventTimelineEventProps {
    group: TimelineEventGroup;
    startTime: number;
    endTime: number;
}

export const EventTimelineEventGroup = ({
    group,
    startTime,
    endTime,
}: IEventTimelineEventProps) => {
    const timelineDuration = endTime - startTime;
    const eventTime = group[0].timestamp;

    const position = `${((eventTime - startTime) / timelineDuration) * 100}%`;

    return (
        <StyledEvent position={position}>
            <HtmlTooltip
                title={<EventTimelineEventTooltip group={group} />}
                maxWidth={320}
                arrow
            >
                <Badge
                    badgeContent={group.length}
                    color='primary'
                    invisible={group.length < 2}
                >
                    <EventTimelineEventCircle group={group} />
                </Badge>
            </HtmlTooltip>
        </StyledEvent>
    );
};
