import type { FC } from 'react';
import { Box, Typography, styled, useTheme } from '@mui/material';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import FlagIcon from '@mui/icons-material/Flag';
import { format } from 'date-fns';
import { capitalizeFirst } from 'utils/capitalizeFirst';
import { withAlpha } from '../chartConfig';
import { type EventGroup, EVENT_TYPE_LABEL, getEventColor } from './eventTheme';

const StyledTooltipContent = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    minWidth: 220,
    maxWidth: 280,
}));

const StyledTooltipHeader = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.25, 1),
    borderRadius: 999,
    backgroundColor: withAlpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.01em',
}));

const StyledEventRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1.25),
}));

const StyledEventIconBadge = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    borderRadius: 4,
    flexShrink: 0,
    marginTop: 1,
});

const StyledEventMeta = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    gap: 4,
});

const StyledEventLabel = styled(Typography)(({ theme }) => ({
    fontSize: 13,
    fontWeight: 600,
    color: theme.palette.text.primary,
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
}));

const StyledEventSubtext = styled(Typography)(({ theme }) => ({
    fontSize: 11,
    color: theme.palette.text.secondary,
    lineHeight: 1.4,
}));

// Detailed breakdown shown on hover over a pill marker. Lists every event in
// the group with its feature flag, type, timestamp, and author.
export const FeatureEventTooltip: FC<{ group: EventGroup }> = ({ group }) => {
    const theme = useTheme();
    const isGrouped = group.events.length > 1;
    // The EventGroup type guarantees a first event, but degrade gracefully
    // if the invariant is ever broken by untyped data.
    const [primaryEvent] = group.events;
    if (!primaryEvent) return null;
    const environment = primaryEvent.environment;
    return (
        <StyledTooltipContent>
            <StyledTooltipHeader>
                <FlagIcon sx={{ fontSize: 12, color: 'inherit' }} />
                {isGrouped
                    ? `${group.events.length} events in ${environment}`
                    : capitalizeFirst(environment)}
            </StyledTooltipHeader>
            {group.events.map((event) => {
                const eventColor = getEventColor(theme, event.type);
                const isDisabled =
                    event.type === 'feature-environment-disabled';
                return (
                    <StyledEventRow key={event.id}>
                        <StyledEventIconBadge
                            sx={{
                                backgroundColor: eventColor,
                                opacity: isDisabled ? 0.5 : 1,
                            }}
                        >
                            <PowerSettingsNewIcon
                                sx={{ fontSize: 12, color: '#fff' }}
                            />
                        </StyledEventIconBadge>
                        <StyledEventMeta>
                            <StyledEventLabel title={event.featureName}>
                                {event.featureName ||
                                    EVENT_TYPE_LABEL[event.type]}
                            </StyledEventLabel>
                            <StyledEventSubtext>
                                {EVENT_TYPE_LABEL[event.type]}
                                {' · '}
                                {format(
                                    new Date(event.timestamp),
                                    'MMM d, HH:mm',
                                )}
                            </StyledEventSubtext>
                            <StyledEventSubtext
                                sx={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {event.createdBy}
                            </StyledEventSubtext>
                        </StyledEventMeta>
                    </StyledEventRow>
                );
            })}
        </StyledTooltipContent>
    );
};
