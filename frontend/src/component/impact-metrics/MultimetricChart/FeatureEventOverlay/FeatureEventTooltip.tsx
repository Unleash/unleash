import type { FC } from 'react';
import { Box, Typography, styled, useTheme, type Theme } from '@mui/material';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import FlagIcon from '@mui/icons-material/Flag';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { format } from 'date-fns';
import { formatLargeNumbers } from '../../metricsFormatters';
import { withAlpha } from '../chartConfig';
import { type EventGroup, EVENT_TYPE_LABEL, getEventColor } from './eventTheme';

export type EventImpactSummary = {
    deltaPct: number | null;
    deltaAbs: number | null;
    halfWindowMs: number;
};

const SMALL_CHANGE_THRESHOLD_PCT = 1;

const formatPct = (pct: number): string => {
    const sign = pct > 0 ? '+' : '\u2212';
    const abs = Math.abs(pct);
    const formatted =
        abs >= 10 || Number.isInteger(abs)
            ? `${Math.round(abs)}`
            : abs.toFixed(1);
    return `${sign}${formatted}%`;
};

const formatAbs = (deltaAbs: number): string => {
    const sign = deltaAbs > 0 ? '+' : deltaAbs < 0 ? '\u2212' : '';
    return `${sign}${formatLargeNumbers(Math.abs(deltaAbs))}`;
};

const formatHalfWindow = (halfWindowMs: number): string => {
    const minutes = Math.round(halfWindowMs / (60 * 1000));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.round(halfWindowMs / (60 * 60 * 1000));
    if (hours < 24) return `${hours}h`;
    const days = Math.round(halfWindowMs / (24 * 60 * 60 * 1000));
    return `${days}d`;
};

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

const StyledImpactRow = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    marginTop: 4,
    fontSize: 12,
    fontWeight: 600,
}));

const StyledImpactCaption = styled(Typography)(({ theme }) => ({
    fontSize: 10,
    color: theme.palette.text.secondary,
    marginTop: 2,
    lineHeight: 1.3,
}));

// Detailed breakdown shown on hover over a pill marker. Lists every event in
// the group with its type, timestamp, and author. When an impact summary is
// provided for an event, the row also shows what that flip did to the goal
// metric.
export const FeatureEventTooltip: FC<{
    group: EventGroup;
    eventImpactById?: Record<number, EventImpactSummary>;
}> = ({ group, eventImpactById }) => {
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
                                {event.featureName
                                    ? `${event.featureName} · ${EVENT_TYPE_LABEL[event.type]}`
                                    : EVENT_TYPE_LABEL[event.type]}
                            </StyledEventLabel>
                            <StyledEventSubtext>
                                {format(
                                    new Date(event.timestamp),
                                    'MMM d, HH:mm',
                                )}
                                {' · '}
                                {event.createdBy}
                            </StyledEventSubtext>
                            {eventImpactById?.[event.id]
                                ? renderImpact(eventImpactById[event.id], theme)
                                : null}
                        </StyledEventMeta>
                    </StyledEventRow>
                );
            })}
        </StyledTooltipContent>
    );
};

const renderImpact = (impact: EventImpactSummary, theme: Theme) => {
    const { deltaPct, deltaAbs, halfWindowMs } = impact;
    const isMeasurable = deltaPct !== null && deltaAbs !== null;
    if (!isMeasurable) {
        return (
            <StyledImpactCaption>
                Not enough surrounding data to measure the goal Δ.
            </StyledImpactCaption>
        );
    }
    const tone =
        Math.abs(deltaPct) < SMALL_CHANGE_THRESHOLD_PCT
            ? 'flat'
            : deltaAbs > 0
              ? 'up'
              : 'down';
    const TrendIcon =
        tone === 'up'
            ? TrendingUpIcon
            : tone === 'down'
              ? TrendingDownIcon
              : TrendingFlatIcon;
    const color =
        tone === 'up'
            ? theme.palette.success.main
            : tone === 'down'
              ? theme.palette.error.main
              : theme.palette.text.secondary;

    return (
        <>
            <StyledImpactRow sx={{ color }}>
                <TrendIcon sx={{ fontSize: 14 }} />
                <span>
                    Goal {formatPct(deltaPct)} ({formatAbs(deltaAbs)})
                </span>
            </StyledImpactRow>
            <StyledImpactCaption>
                Measured ±{formatHalfWindow(halfWindowMs)} around this flip
            </StyledImpactCaption>
        </>
    );
};
