import type { EventSchemaType } from 'openapi';
import { styled } from '@mui/material';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { EventTimelineEventTooltip } from './EventTimelineEventTooltip/EventTimelineEventTooltip';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import SegmentsIcon from '@mui/icons-material/DonutLargeOutlined';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import type { TimelineEvent, TimelineEventGroup } from '../EventTimeline';
import type { ISignal } from 'interfaces/signal';
import { EventTimelineGroup } from './EventTimelineGroup';
import { EventTimelineSignal } from './EventTimelineSignal';

type DefaultEventVariant = 'secondary';
type CustomEventVariant = 'success' | 'neutral';
type EventVariant = DefaultEventVariant | CustomEventVariant;

export const StyledEvent = styled('div', {
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

export const StyledEventCircle = styled('div', {
    shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: EventVariant }>(({ theme, variant }) => ({
    height: theme.spacing(3.75),
    width: theme.spacing(3.75),
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
    '&:hover': {
        transform: 'scale(1.5)',
    },
}));

export const getEventIcon = (type: EventSchemaType) => {
    if (type === 'feature-environment-enabled') {
        return <ToggleOnIcon />;
    }
    if (type === 'feature-environment-disabled') {
        return <ToggleOffIcon />;
    }
    if (type.startsWith('strategy-') || type.startsWith('feature-strategy-')) {
        return <ExtensionOutlinedIcon />;
    }
    if (type.startsWith('feature-')) {
        return <FlagOutlinedIcon />;
    }
    if (type.startsWith('segment-')) {
        return <SegmentsIcon />;
    }

    return <QuestionMarkIcon />;
};

export const customEventVariants: Partial<
    Record<EventSchemaType, CustomEventVariant>
> = {
    'feature-environment-enabled': 'success',
    'feature-environment-disabled': 'neutral',
    'feature-archived': 'neutral',
};

export interface IEventTimelineEventProps {
    event: TimelineEvent | TimelineEventGroup;
    position: string;
}

export const isSignal = (
    event: TimelineEvent | TimelineEventGroup,
): event is ISignal => {
    return !Array.isArray(event) && 'source' in event;
};

export const EventTimelineEvent = ({
    event,
    position,
}: IEventTimelineEventProps) => {
    if (Array.isArray(event)) {
        return <EventTimelineGroup event={event} position={position} />;
    }

    if (isSignal(event)) {
        return <EventTimelineSignal event={event} position={position} />;
    }

    const variant = customEventVariants[event.type] || 'secondary';

    return (
        <StyledEvent position={position}>
            <HtmlTooltip
                title={<EventTimelineEventTooltip event={event} />}
                maxWidth={320}
                arrow
            >
                <StyledEventCircle variant={variant}>
                    {getEventIcon(event.type)}
                </StyledEventCircle>
            </HtmlTooltip>
        </StyledEvent>
    );
};
