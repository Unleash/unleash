import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import SegmentsIcon from '@mui/icons-material/DonutLargeOutlined';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { Icon, styled } from '@mui/material';
import type {
    TimelineEvent,
    TimelineEventGroup,
    TimelineEventType,
} from '../EventTimeline.tsx';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import type { HTMLAttributes } from 'react';
import SensorsIcon from '@mui/icons-material/Sensors';

type DefaultEventVariant = 'secondary';
type CustomEventVariant = 'success' | 'neutral' | 'warning' | 'error';
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
    '& svg, span': {
        color: theme.palette[variant].main,
    },
    '& svg': {
        height: theme.spacing(2.5),
        width: theme.spacing(2.5),
    },
    '& span': {
        fontSize: theme.fontSizes.bodySize,
    },
    '&:hover': {
        transform: 'scale(1.5)',
    },
}));

const getEventIcon = ({ icon, type }: Pick<TimelineEvent, 'icon' | 'type'>) => {
    if (icon) {
        return <Icon>{icon}</Icon>;
    }

    if (type === 'signal') {
        return <SensorsIcon />;
    }
    if (type === 'feature-environment-enabled') {
        return <ToggleOnIcon />;
    }
    if (type === 'feature-environment-disabled') {
        return <ToggleOffIcon />;
    }
    if (
        type.startsWith('strategy-') ||
        type.startsWith('feature-strategy-') ||
        type.startsWith('release-plan-')
    ) {
        return (
            <ExtensionOutlinedIcon
                sx={{ marginTop: '-2px', marginRight: '-2px' }}
            />
        );
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

const isValidVariant = (variant?: string): variant is EventVariant =>
    variant !== undefined &&
    ['secondary', 'success', 'neutral', 'warning', 'error'].includes(variant);

interface IEventTimelineEventCircleProps
    extends HTMLAttributes<HTMLDivElement> {
    group: TimelineEventGroup;
}

export const EventTimelineEventCircle = ({
    group,
    ...props
}: IEventTimelineEventCircleProps) => {
    if (
        group.length === 1 ||
        !group.some(
            ({ type, icon }) =>
                type !== group[0].type || icon !== group[0].icon,
        )
    ) {
        const event = group[0];

        return (
            <StyledEventCircle
                variant={
                    isValidVariant(event.variant)
                        ? event.variant
                        : customEventVariants[event.type]
                }
                {...props}
            >
                {getEventIcon(event)}
            </StyledEventCircle>
        );
    }

    return (
        <StyledEventCircle {...props}>
            <MoreHorizIcon />
        </StyledEventCircle>
    );
};
