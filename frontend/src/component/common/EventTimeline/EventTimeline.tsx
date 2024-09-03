import { styled, useTheme } from '@mui/material';
import { useEventSearch } from 'hooks/api/getters/useEventSearch/useEventSearch';
import type { EventSchema, EventSchemaType } from 'openapi';
import { ArcherContainer, ArcherElement } from 'react-archer';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import { HtmlTooltip } from '../HtmlTooltip/HtmlTooltip';
import { formatDateYMDHMS } from 'utils/formatDate';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';
import { startOfDay } from 'date-fns';

const StyledArcherContainer = styled(ArcherContainer)({
    width: '100%',
    height: '100%',
});

const StyledTimelineContainer = styled('div')(({ theme }) => ({
    position: 'relative',
    height: theme.spacing(1),
    width: '100%',
    display: 'flex',
    alignItems: 'center',
}));

const StyledEventContainer = styled('div')({
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

const StyledNonEvent = styled('div')(({ theme }) => ({
    height: theme.spacing(0.25),
    width: theme.spacing(0.25),
    backgroundColor: theme.palette.secondary.border,
}));

const StyledEvent = styled(StyledEventContainer, {
    shouldForwardProp: (prop) => prop !== 'position',
})<{ position: string }>(({ theme, position }) => ({
    left: position,
    transform: 'translateX(-100%)',
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

const StyledStart = styled(StyledEventContainer)(({ theme }) => ({
    height: theme.spacing(0.25),
    width: theme.spacing(0.25),
    left: 0,
}));

const StyledEnd = styled(StyledEventContainer)(({ theme }) => ({
    height: theme.spacing(0.25),
    width: theme.spacing(0.25),
    right: 0,
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

const getEventTooltip = (event: EventSchema, locale: string) => {
    if (event.type === 'feature-environment-enabled') {
        return (
            <div>
                <small>{formatDateYMDHMS(event.createdAt, locale)}</small>
                <p>
                    {event.createdBy} enabled {event.featureName} for the{' '}
                    {event.environment} environment in project {event.project}
                </p>
            </div>
        );
    }
    if (event.type === 'feature-environment-disabled') {
        return (
            <div>
                <small>{formatDateYMDHMS(event.createdAt, locale)}</small>
                <p>
                    {event.createdBy} disabled {event.featureName} for the{' '}
                    {event.environment} environment in project {event.project}
                </p>
            </div>
        );
    }

    return (
        <div>
            <div>{formatDateYMDHMS(event.createdAt, locale)}</div>
            <div>{event.createdBy}</div>
            <div>{event.type}</div>
            <div>{event.featureName}</div>
            <div>{event.environment}</div>
        </div>
    );
};

export const EventTimeline: React.FC = () => {
    const { locationSettings } = useLocationSettings();
    const theme = useTheme();

    const endDate = new Date();
    const startDate = startOfDay(endDate);

    const { events } = useEventSearch({
        from: `IS:${startDate.toISOString().split('T')[0]}`,
        to: `IS:${endDate.toISOString().split('T')[0]}`,
    });

    const sortedEvents = [...events].reverse();

    const timelineDuration = endDate.getTime() - startDate.getTime();

    const calculatePosition = (eventDate: string): string => {
        const eventTime = new Date(eventDate).getTime();
        const positionPercentage =
            ((eventTime - startDate.getTime()) / timelineDuration) * 100;
        return `${positionPercentage}%`;
    };

    return (
        <StyledArcherContainer
            strokeColor={theme.palette.text.primary}
            endMarker={false}
        >
            <StyledTimelineContainer>
                <ArcherElement
                    id='start'
                    relations={[
                        {
                            targetId: sortedEvents[0]?.id.toString() ?? 'end',
                            targetAnchor: 'left',
                            sourceAnchor: 'right',
                            style: {
                                strokeColor: theme.palette.secondary.border,
                            },
                        },
                    ]}
                >
                    <StyledStart>
                        <StyledNonEvent />
                        <ConditionallyRender
                            condition={false}
                            show={<span>show</span>}
                        />
                    </StyledStart>
                </ArcherElement>
                {sortedEvents.map((event, i) => (
                    <ArcherElement
                        key={event.id}
                        id={event.id.toString()}
                        relations={[
                            {
                                targetId:
                                    sortedEvents[i + 1]?.id.toString() ?? 'end',
                                targetAnchor: 'left',
                                sourceAnchor: 'right',
                                style: {
                                    strokeColor: theme.palette.secondary.border,
                                },
                            },
                        ]}
                    >
                        <StyledEvent
                            position={calculatePosition(event.createdAt)}
                        >
                            <HtmlTooltip
                                title={getEventTooltip(
                                    event,
                                    locationSettings.locale,
                                )}
                                arrow
                            >
                                <StyledEventCircle>
                                    {getEventIcon(event.type)}
                                </StyledEventCircle>
                            </HtmlTooltip>
                        </StyledEvent>
                    </ArcherElement>
                ))}
                <ArcherElement id='end'>
                    <StyledEnd>
                        <StyledNonEvent />
                    </StyledEnd>
                </ArcherElement>
            </StyledTimelineContainer>
        </StyledArcherContainer>
    );
};
