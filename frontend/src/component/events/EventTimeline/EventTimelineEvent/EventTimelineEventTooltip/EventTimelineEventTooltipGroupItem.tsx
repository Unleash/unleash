import { styled } from '@mui/material';
import { Markdown } from 'component/common/Markdown/Markdown';
import {
    customEventVariants,
    getEventIcon,
    isSignal,
} from '../EventTimelineEvent';
import type { TimelineEvent } from '../../EventTimeline';

type DefaultEventVariant = 'secondary';
type CustomEventVariant = 'success' | 'neutral';
type EventVariant = DefaultEventVariant | CustomEventVariant;

const StyledEventCircle = styled('div', {
    shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: EventVariant }>(({ theme, variant }) => ({
    height: theme.spacing(3),
    width: theme.spacing(3),
    borderRadius: '50%',
    backgroundColor: theme.palette[variant].light,
    border: `1px solid ${theme.palette[variant].main}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s',
    '& svg': {
        color: theme.palette[variant].main,
        height: theme.spacing(2.5),
        width: theme.spacing(2.5),
    },
}));

const StyledTooltipGroupItemHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
    gap: theme.spacing(2),
}));

const StyledTooltipGroupItemIcon = styled('div')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSizes.smallBody,
    wordBreak: 'break-word',
}));

const StyledDateGroupItemText = styled('div')(({ theme }) => ({
    color: theme.palette.text.secondary,
    wordBreak: 'break-word',
}));

interface IEventTimelineEventTooltipGroupItemProps {
    event: TimelineEvent;
}

export const EventTimelineEventTooltipGroupItem = ({
    event,
}: IEventTimelineEventTooltipGroupItemProps) => {
    if (isSignal(event)) {
        return null;
    }

    const variant = customEventVariants[event.type] || 'secondary';

    return (
        <>
            <StyledTooltipGroupItemHeader>
                <StyledTooltipGroupItemIcon>
                    <StyledEventCircle variant={variant}>
                        {getEventIcon(event.type)}
                    </StyledEventCircle>
                </StyledTooltipGroupItemIcon>
                <StyledDateGroupItemText>
                    <Markdown key={event.id}>{event.summary}</Markdown>
                </StyledDateGroupItemText>
            </StyledTooltipGroupItemHeader>
        </>
    );
};
