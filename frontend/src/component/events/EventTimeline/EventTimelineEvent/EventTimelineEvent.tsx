import type { EventSchema, EventSchemaType } from 'openapi';
import { styled } from '@mui/material';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { EventTimelineEventTooltip } from './EventTimelineEventTooltip/EventTimelineEventTooltip';

const StyledEvent = styled('div', {
    shouldForwardProp: (prop) => prop !== 'position',
})<{ position: string }>(({ theme, position }) => ({
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    left: position,
    transform: 'translateX(-50%)',
    padding: theme.spacing(0, 0.25),
    zIndex: 1,
}));

const StyledEventCircle = styled('div')(({ theme }) => ({
    height: theme.spacing(2.25),
    width: theme.spacing(2.25),
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s',
    '& svg': {
        color: theme.palette.primary.contrastText,
        height: theme.spacing(2),
        width: theme.spacing(2),
    },
    '&:hover': {
        transform: 'scale(1.5)',
    },
}));

const getEventIcon = (type: EventSchemaType) => {
    switch (type) {
        case 'feature-environment-enabled':
            return <ToggleOnIcon />;
        case 'feature-environment-disabled':
            return <ToggleOffIcon />;
        default:
            return null;
    }
};

interface IEventTimelineEventProps {
    event: EventSchema;
    startDate: Date;
    endDate: Date;
}

export const EventTimelineEvent = ({
    event,
    startDate,
    endDate,
}: IEventTimelineEventProps) => {
    const timelineDuration = endDate.getTime() - startDate.getTime();
    const eventTime = new Date(event.createdAt).getTime();

    const position = `${((eventTime - startDate.getTime()) / timelineDuration) * 100}%`;

    return (
        <StyledEvent position={position}>
            <HtmlTooltip
                title={<EventTimelineEventTooltip event={event} />}
                arrow
            >
                <StyledEventCircle>
                    {getEventIcon(event.type)}
                </StyledEventCircle>
            </HtmlTooltip>
        </StyledEvent>
    );
};
