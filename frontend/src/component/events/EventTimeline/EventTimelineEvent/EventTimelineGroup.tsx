import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { StyledEvent } from './EventTimelineEvent';
import { EventTimelineEventTooltip } from './EventTimelineEventTooltip/EventTimelineEventTooltip';
import { Badge, styled } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import type { TimelineEventGroup } from '../EventTimeline';

const StyledEventCircle = styled('div')(({ theme }) => ({
    height: theme.spacing(3.75),
    width: theme.spacing(3.75),
    borderRadius: '50%',
    backgroundColor: theme.palette.secondary.light,
    border: `1px solid ${theme.palette.primary.main}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s',
    '& svg': {
        color: theme.palette.primary.main,
        height: theme.spacing(2.5),
        width: theme.spacing(2.5),
    },
    '&:hover': {
        transform: 'scale(1.5)',
    },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        fontSize: theme.fontSizes.smallerBody,
        fontWeight: theme.fontWeight.bold,
    },
}));

export interface IEventTimelineGroupProps {
    event: TimelineEventGroup;
    position: string;
}

export const EventTimelineGroup = ({
    event,
    position,
}: IEventTimelineGroupProps) => {
    return (
        <StyledEvent position={position}>
            <HtmlTooltip
                title={<EventTimelineEventTooltip event={event} />}
                maxWidth={320}
                arrow
            >
                <StyledBadge badgeContent={event.length} color='primary'>
                    <StyledEventCircle>
                        <MoreHorizIcon />
                    </StyledEventCircle>
                </StyledBadge>
            </HtmlTooltip>
        </StyledEvent>
    );
};
