import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import {
    StyledEvent,
    type IEventTimelineEventProps,
} from './EventTimelineEvent';
import { EventTimelineEventTooltip } from './EventTimelineEventTooltip/EventTimelineEventTooltip';
import { styled } from '@mui/material';

const StyledEventCircle = styled('div')(({ theme }) => ({
    height: theme.spacing(3.75),
    width: theme.spacing(3.75),
    borderRadius: '50%',
    backgroundColor: theme.palette.warning.light,
    border: `1px solid ${theme.palette.warning.main}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s',
    '& svg': {
        color: theme.palette.warning.main,
        height: theme.spacing(2.5),
        width: theme.spacing(2.5),
    },
    '&:hover': {
        transform: 'scale(1.5)',
    },
}));
export const EventTimelineSignal = ({
    event,
    position,
}: IEventTimelineEventProps) => {
    return (
        <StyledEvent position={position}>
            <HtmlTooltip
                title={<EventTimelineEventTooltip event={event} />}
                maxWidth={320}
                arrow
            >
                <StyledEventCircle>
                    {/*getEventIcon(event.type)*/}
                </StyledEventCircle>
            </HtmlTooltip>
        </StyledEvent>
    );
};
