import { Badge, styled } from '@mui/material';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { EventTimelineEventTooltip } from './EventTimelineEventTooltip/EventTimelineEventTooltip.tsx';
import type { TimelineEventGroup } from '../EventTimeline.tsx';
import { EventTimelineEventCircle } from './EventTimelineEventCircle.tsx';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

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

const StyledBadge = styled(Badge)(({ theme }) => ({
    '.MuiBadge-badge': {
        backgroundColor: theme.palette.background.alternative,
        color: theme.palette.primary.contrastText,
    },
}));

export const EventTimelineEventGroup = ({
    group,
    startTime,
    endTime,
}: IEventTimelineEventProps) => {
    const { trackEvent } = usePlausibleTracker();
    const timelineDuration = endTime - startTime;
    const eventTime = group[0].timestamp;

    const position = `${((eventTime - startTime) / timelineDuration) * 100}%`;
    const trackHover = () => {
        trackEvent('event-timeline', {
            props: {
                eventType: 'event hover',
            },
        });
    };

    return (
        <StyledEvent position={position} onMouseEnter={trackHover}>
            <HtmlTooltip
                title={<EventTimelineEventTooltip group={group} />}
                maxWidth={350}
                arrow
            >
                <StyledBadge
                    badgeContent={group.length}
                    invisible={group.length < 2}
                >
                    <EventTimelineEventCircle group={group} />
                </StyledBadge>
            </HtmlTooltip>
        </StyledEvent>
    );
};
