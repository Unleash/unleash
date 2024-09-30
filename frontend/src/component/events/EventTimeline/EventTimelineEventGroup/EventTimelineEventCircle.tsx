import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import SegmentsIcon from '@mui/icons-material/DonutLargeOutlined';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { styled } from '@mui/material';
import type { TimelineEventGroup, TimelineEventType } from '../EventTimeline';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import type { HTMLAttributes } from 'react';
import SensorsIcon from '@mui/icons-material/Sensors';

type DefaultEventVariant = 'secondary';
type CustomEventVariant = 'success' | 'neutral' | 'warning';
type EventVariant = DefaultEventVariant | CustomEventVariant;

const StyledEventCircle = styled('div', {
    shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant?: EventVariant }>(({ theme, variant = 'secondary' }) => ({
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
    '&:hover': {
        transform: 'scale(1.5)',
    },
}));

const getEventIcon = (type: TimelineEventType) => {
    if (type === 'signal') {
        return <SensorsIcon />;
    }
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

const customEventVariants: Partial<
    Record<TimelineEventType, CustomEventVariant>
> = {
    signal: 'warning',
    'feature-environment-enabled': 'success',
    'feature-environment-disabled': 'neutral',
    'feature-archived': 'neutral',
};

interface IEventTimelineEventCircleProps
    extends HTMLAttributes<HTMLDivElement> {
    group: TimelineEventGroup;
}

export const EventTimelineEventCircle = ({
    group,
    ...props
}: IEventTimelineEventCircleProps) => {
    if (group.length === 1) {
        const event = group[0];

        return (
            <StyledEventCircle
                variant={customEventVariants[event.type]}
                {...props}
            >
                {getEventIcon(event.type)}
            </StyledEventCircle>
        );
    }

    return (
        <StyledEventCircle {...props}>
            <MoreHorizIcon />
        </StyledEventCircle>
    );
};
