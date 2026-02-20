import type { FC } from 'react';
import { Badge, styled, Tooltip, Typography } from '@mui/material';
import type {
    FeatureTimelineEvent,
    FeatureTimelineEventGroupType,
} from './FeatureTimeline';
import { formatDistanceToNow } from 'date-fns';

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
    cursor: 'pointer',
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
    '.MuiBadge-badge': {
        backgroundColor: theme.palette.background.alternative,
        color: theme.palette.primary.contrastText,
    },
}));

const StyledCircle = styled('div', {
    shouldForwardProp: (prop) => prop !== 'eventType',
})<{ eventType: string }>(({ theme, eventType }) => {
    const getColor = () => {
        if (eventType.includes('enabled')) return theme.palette.success.main;
        if (eventType.includes('disabled')) return theme.palette.error.main;
        if (eventType.includes('strategy')) return theme.palette.primary.main;
        if (eventType.includes('created')) return theme.palette.info.main;
        return theme.palette.secondary.main;
    };

    return {
        width: theme.spacing(1.5),
        height: theme.spacing(1.5),
        borderRadius: '50%',
        backgroundColor: getColor(),
        border: `2px solid ${theme.palette.background.paper}`,
        boxShadow: theme.boxShadows.popup,
        transition: 'transform 0.2s ease',
        '&:hover': {
            transform: 'scale(1.3)',
        },
    };
});

const StyledTooltipContent = styled('div')(({ theme }) => ({
    padding: theme.spacing(1),
    maxWidth: 280,
}));

const StyledEventItem = styled('div')(({ theme }) => ({
    padding: theme.spacing(0.5, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
        borderBottom: 'none',
    },
}));

const StyledEventType = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.text.primary,
}));

const StyledEventTime = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

interface FeatureTimelineEventGroupProps {
    group: FeatureTimelineEventGroupType;
    startTime: number;
    endTime: number;
    onClick?: (event: FeatureTimelineEvent) => void;
}

const formatEventType = (type: string): string => {
    return type
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const FeatureTimelineEventGroup: FC<FeatureTimelineEventGroupProps> = ({
    group,
    startTime,
    endTime,
    onClick,
}) => {
    const timelineDuration = endTime - startTime;
    const eventTime = group[0].timestamp;
    const position = `${((eventTime - startTime) / timelineDuration) * 100}%`;

    const tooltipContent = (
        <StyledTooltipContent>
            {group.slice(0, 5).map((event) => (
                <StyledEventItem key={event.id}>
                    <StyledEventType>
                        {formatEventType(event.type)}
                    </StyledEventType>
                    <StyledEventTime>
                        {formatDistanceToNow(event.timestamp, {
                            addSuffix: true,
                        })}
                        {event.environment && ` in ${event.environment}`}
                    </StyledEventTime>
                </StyledEventItem>
            ))}
            {group.length > 5 && (
                <StyledEventTime sx={{ pt: 1 }}>
                    +{group.length - 5} more events
                </StyledEventTime>
            )}
        </StyledTooltipContent>
    );

    const handleClick = () => {
        if (onClick && group.length === 1) {
            onClick(group[0]);
        }
    };

    return (
        <StyledEvent position={position} onClick={handleClick}>
            <Tooltip title={tooltipContent} arrow placement='top'>
                <StyledBadge
                    badgeContent={group.length}
                    invisible={group.length < 2}
                >
                    <StyledCircle eventType={group[0].type} />
                </StyledBadge>
            </Tooltip>
        </StyledEvent>
    );
};
