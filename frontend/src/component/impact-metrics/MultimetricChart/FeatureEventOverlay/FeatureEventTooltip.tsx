import type { FC } from 'react';
import { Box, Typography, styled, useTheme } from '@mui/material';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import FlagIcon from '@mui/icons-material/Flag';
import { format } from 'date-fns';
import { withAlpha } from '../chartConfig';
import { type EventGroup, EVENT_TYPE_LABEL, getEventColor } from './eventTheme';

const StyledTooltipContent = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    minWidth: 200,
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
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledEventIconBadge = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    borderRadius: 6,
    flexShrink: 0,
});

const StyledEventMeta = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    gap: 2,
});

const StyledEventLabel = styled(Typography)(({ theme }) => ({
    fontSize: 13,
    fontWeight: 600,
    color: theme.palette.text.primary,
    lineHeight: 1.3,
}));

const StyledEventSubtext = styled(Typography)(({ theme }) => ({
    fontSize: 11,
    color: theme.palette.text.secondary,
    lineHeight: 1.4,
}));

// Detailed breakdown shown on hover over a pill marker. Lists every event in
// the group with its type, timestamp, and author.
export const FeatureEventTooltip: FC<{ group: EventGroup }> = ({ group }) => {
    const theme = useTheme();
    const isGrouped = group.events.length > 1;
    return (
        <StyledTooltipContent>
            <StyledTooltipHeader>
                <FlagIcon sx={{ fontSize: 12, color: 'inherit' }} />
                {isGrouped
                    ? `${group.events.length} events in production`
                    : 'Production'}
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
                            <StyledEventLabel>
                                {EVENT_TYPE_LABEL[event.type]}
                            </StyledEventLabel>
                            <StyledEventSubtext>
                                {format(
                                    new Date(event.timestamp),
                                    'MMM d, HH:mm',
                                )}
                                {' · '}
                                {event.createdBy}
                            </StyledEventSubtext>
                        </StyledEventMeta>
                    </StyledEventRow>
                );
            })}
        </StyledTooltipContent>
    );
};
