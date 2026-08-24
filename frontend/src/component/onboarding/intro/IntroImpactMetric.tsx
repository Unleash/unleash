import type { ReactNode } from 'react';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import { alpha, Box, styled, Typography } from '@mui/material';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';

const CHART_HEIGHT = 72;
const EVENT_LANE_HEIGHT = 28;
const EVENT_MARKER_CENTER = 12;

const StyledCard = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    overflow: 'hidden',
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    minHeight: 44,
    padding: theme.spacing(1, 1.25, 0),
}));

const StyledMetricCopy = styled(Box)({
    minWidth: 0,
});

const StyledLabel = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: 1.3,
}));

const StyledMetadata = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallerBody,
    lineHeight: 1.35,
}));

const StyledValue = styled('span')(({ theme }) => ({
    flexShrink: 0,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    fontVariantNumeric: 'tabular-nums',
}));

const StyledChart = styled(Box)(({ theme }) => ({
    position: 'relative',
    paddingTop: EVENT_LANE_HEIGHT,
    margin: theme.spacing(0, 1.25, 1),
}));

const StyledSvg = styled('svg')({
    display: 'block',
    width: '100%',
    height: CHART_HEIGHT,
    overflow: 'visible',
});

const StyledEventMarker = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'eventType' && prop !== 'grouped',
})<{
    eventType: IIntroImpactMetricEvent['type'];
    grouped: boolean;
}>(({ theme, eventType, grouped }) => {
    const eventColor = grouped
        ? theme.palette.primary.main
        : eventType === 'enabled'
          ? theme.palette.success.main
          : eventType === 'disabled'
            ? theme.palette.neutral.main
            : eventType === 'automated-disabled'
              ? theme.palette.success.main
              : theme.palette.primary.main;

    return {
        position: 'absolute',
        zIndex: 2,
        top: EVENT_MARKER_CENTER,
        bottom: 0,
        width: 1,
        transform: 'translateX(-50%)',
        borderLeft: `1px dashed ${alpha(eventColor, 0.55)}`,
        color: eventColor,
    };
});

const StyledEventPill = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'eventType' && prop !== 'grouped',
})<{
    eventType: IIntroImpactMetricEvent['type'];
    grouped: boolean;
}>(({ theme, eventType, grouped }) => {
    const automated = !grouped && eventType === 'automated-disabled';
    const eventColor = grouped
        ? theme.palette.primary.main
        : eventType === 'enabled'
          ? theme.palette.success.main
          : eventType === 'disabled'
            ? theme.palette.neutral.main
            : eventType === 'automated-disabled'
              ? theme.palette.success.main
              : theme.palette.primary.main;
    const eventBackground = grouped
        ? theme.palette.primary.container
        : eventType === 'enabled'
          ? theme.palette.success.light
          : eventType === 'disabled'
            ? theme.palette.neutral.light
            : eventType === 'automated-disabled'
              ? theme.palette.success.light
              : theme.palette.primary.container;

    return {
        position: 'absolute',
        top: 0,
        left: 0,
        boxSizing: 'border-box',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        padding: 0,
        transform: 'translate(-50%, -50%) scale(1)',
        borderRadius: '50%',
        color: automated ? theme.palette.neutral.main : eventColor,
        background: automated ? theme.palette.neutral.light : eventBackground,
        border: '1px solid currentColor',
        boxShadow: theme.shadows[1],
        cursor: 'pointer',
        lineHeight: 0,
        animation: 'impactEventMarkerIn 180ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        transition:
            'transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease',
        '@keyframes impactEventMarkerIn': {
            from: {
                opacity: 0,
                transform: 'translate(-50%, -50%) scale(0.72)',
            },
            to: {
                opacity: 1,
                transform: 'translate(-50%, -50%) scale(1)',
            },
        },
        '&:hover, &:focus-visible': {
            transform: 'translate(-50%, -50%) scale(1.18)',
            boxShadow: theme.shadows[3],
        },
        '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
            transition: 'none',
        },
        '& > svg': {
            display: 'block',
            width: 20,
            height: 20,
        },
    };
});

const StyledGroupedEventCount = styled('span')(({ theme }) => ({
    fontSize: 11,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: 1,
}));

const StyledAutomationBadge = styled(Box)(({ theme }) => ({
    position: 'absolute',
    zIndex: 1,
    top: -6,
    right: -7,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: '50%',
    color: theme.palette.primary.main,
    background: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    '& svg': {
        width: 12,
        height: 12,
    },
}));

const StyledEventTooltip = styled(Box)(({ theme }) => ({
    display: 'flex',
    minWidth: 190,
    flexDirection: 'column',
    gap: theme.spacing(1.25),
}));

const StyledEventTooltipTitle = styled('strong')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

const StyledEventTooltipList = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledEventTooltipRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    color: theme.palette.text.primary,
}));

const StyledEventTooltipIcon = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'eventType',
})<{ eventType: IIntroImpactMetricEvent['type'] }>(({ theme, eventType }) => {
    const automated = eventType === 'automated-disabled';
    const eventColor =
        eventType === 'enabled'
            ? theme.palette.success.main
            : eventType === 'disabled'
              ? theme.palette.neutral.main
              : eventType === 'automated-disabled'
                ? theme.palette.success.main
                : theme.palette.primary.main;
    const eventBackground =
        eventType === 'enabled'
            ? theme.palette.success.light
            : eventType === 'disabled'
              ? theme.palette.neutral.light
              : eventType === 'automated-disabled'
                ? theme.palette.success.light
                : theme.palette.primary.container;

    return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: 20,
        height: 20,
        flexShrink: 0,
        borderRadius: '50%',
        color: automated ? theme.palette.neutral.main : eventColor,
        background: automated ? theme.palette.neutral.light : eventBackground,
        border: '1px solid currentColor',
        '& > svg': {
            width: 17,
            height: 17,
        },
    };
});

const StyledThresholdLabel = styled(Box)(({ theme }) => ({
    position: 'absolute',
    right: 2,
    zIndex: 1,
    transform: 'translateY(-100%)',
    padding: theme.spacing(0.1, 0.45),
    borderRadius: theme.shape.borderRadiusSmall,
    background: theme.palette.background.paper,
    fontSize: 9,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: 1.4,
}));

const buildPaths = (data: number[], max: number) => {
    const width = 100;
    const stepX = width / (data.length - 1);
    const linePoints = data.map(
        (v, i) => `${i * stepX},${CHART_HEIGHT - (v / max) * CHART_HEIGHT}`,
    );
    const linePath = `M${linePoints.join(' L')}`;
    const fillPath = `${linePath} L${width},${CHART_HEIGHT} L0,${CHART_HEIGHT} Z`;
    return { linePath, fillPath, width };
};

export interface IIntroImpactMetricEvent {
    id: number;
    type: 'enabled' | 'disabled' | 'automated-disabled' | 'milestone';
    position: number;
    label?: string;
}

interface IIntroImpactMetricEventGroup {
    position: number;
    events: IIntroImpactMetricEvent[];
}

// Match the real impact-metrics overlay: events within 3% of the chart width
// share one marker so quick toggles remain readable.
const groupEventsByProximity = (
    events: IIntroImpactMetricEvent[],
): IIntroImpactMetricEventGroup[] => {
    const groups: IIntroImpactMetricEventGroup[] = [];
    const sorted = [...events].sort(
        (left, right) => left.position - right.position || left.id - right.id,
    );

    for (const event of sorted) {
        const last = groups.at(-1);
        if (last && event.position - last.position < 3) {
            last.events.push(event);
            last.position +=
                (event.position - last.position) / last.events.length;
        } else {
            groups.push({ position: event.position, events: [event] });
        }
    }

    return groups;
};

interface IIntroImpactMetricProps {
    label: ReactNode;
    metadata: string;
    data: number[];
    max: number;
    color: string;
    formatValue: (value: number) => string;
    threshold?: number;
    events?: IIntroImpactMetricEvent[];
    testId?: string;
}

/**
 * A compact version of the real impact-metric chart. New samples enter only
 * when the demo receives new traffic, so nothing changes while somebody is
 * still reading the step.
 */
export const IntroImpactMetric = ({
    label,
    metadata,
    data,
    max,
    color,
    formatValue,
    threshold,
    events = [],
    testId,
}: IIntroImpactMetricProps) => {
    const now = data[data.length - 1];
    const renderMax = Math.max(max, ...data);
    const { linePath, fillPath, width } = buildPaths(data, renderMax);
    const eventGroups = groupEventsByProximity(events);
    const thresholdY =
        threshold === undefined
            ? undefined
            : CHART_HEIGHT - (threshold / renderMax) * CHART_HEIGHT;

    return (
        <StyledCard data-testid={testId} data-max={max}>
            <StyledHeader>
                <StyledMetricCopy>
                    <StyledLabel>{label}</StyledLabel>
                    <StyledMetadata>{metadata}</StyledMetadata>
                </StyledMetricCopy>
                <StyledValue
                    data-testid={testId ? `${testId}_VALUE` : undefined}
                    style={{ color }}
                >
                    {formatValue(now)}
                </StyledValue>
            </StyledHeader>
            <StyledChart>
                {eventGroups.map((group) => {
                    const primary = group.events.at(-1)!;
                    const grouped = group.events.length > 1;
                    const eventLabel = (event: IIntroImpactMetricEvent) =>
                        event.type === 'milestone'
                            ? `Milestone started: ${event.label}`
                            : event.type === 'automated-disabled'
                              ? 'Safeguard disabled production'
                              : `${
                                    event.type === 'enabled'
                                        ? 'Enabled'
                                        : 'Disabled'
                                } in production`;
                    const title = grouped ? (
                        <StyledEventTooltip>
                            <StyledEventTooltipTitle>
                                {group.events.length} events occurred
                            </StyledEventTooltipTitle>
                            <StyledEventTooltipList>
                                {group.events.map((event) => (
                                    <StyledEventTooltipRow
                                        key={event.id}
                                        data-testid='QUICK_TOUR_INTRO_EVENT_TOOLTIP_ITEM'
                                    >
                                        <StyledEventTooltipIcon
                                            eventType={event.type}
                                        >
                                            {event.type === 'enabled' ? (
                                                <ToggleOnIcon />
                                            ) : event.type === 'disabled' ? (
                                                <ToggleOffIcon />
                                            ) : event.type ===
                                              'automated-disabled' ? (
                                                <>
                                                    <ToggleOffIcon />
                                                    <StyledAutomationBadge>
                                                        <ShieldOutlinedIcon />
                                                    </StyledAutomationBadge>
                                                </>
                                            ) : (
                                                <FlagOutlinedIcon />
                                            )}
                                        </StyledEventTooltipIcon>
                                        <span>{eventLabel(event)}</span>
                                    </StyledEventTooltipRow>
                                ))}
                            </StyledEventTooltipList>
                        </StyledEventTooltip>
                    ) : (
                        eventLabel(primary)
                    );

                    return (
                        <StyledEventMarker
                            key={`${group.events[0].id}-${group.events.length}`}
                            eventType={primary.type}
                            grouped={grouped}
                            sx={{ left: `${group.position}%` }}
                            data-testid='QUICK_TOUR_INTRO_EVENT_MARKER'
                        >
                            <HtmlTooltip title={title} maxWidth={260} arrow>
                                <StyledEventPill
                                    eventType={primary.type}
                                    grouped={grouped}
                                    role='img'
                                    tabIndex={0}
                                    aria-label={
                                        grouped
                                            ? `${group.events.length} events in production`
                                            : eventLabel(primary)
                                    }
                                    data-testid={
                                        grouped
                                            ? 'QUICK_TOUR_INTRO_EVENT_GROUP'
                                            : primary.type ===
                                                'automated-disabled'
                                              ? 'QUICK_TOUR_INTRO_EVENT_SAFEGUARD_DISABLED'
                                              : `QUICK_TOUR_INTRO_EVENT_${primary.type.toUpperCase()}`
                                    }
                                >
                                    {grouped ? (
                                        <StyledGroupedEventCount data-testid='QUICK_TOUR_INTRO_EVENT_GROUP_COUNT'>
                                            {group.events.length}
                                        </StyledGroupedEventCount>
                                    ) : primary.type === 'enabled' ? (
                                        <ToggleOnIcon />
                                    ) : primary.type === 'disabled' ? (
                                        <ToggleOffIcon />
                                    ) : primary.type ===
                                      'automated-disabled' ? (
                                        <>
                                            <ToggleOffIcon />
                                            <StyledAutomationBadge>
                                                <ShieldOutlinedIcon />
                                            </StyledAutomationBadge>
                                        </>
                                    ) : (
                                        <FlagOutlinedIcon />
                                    )}
                                </StyledEventPill>
                            </HtmlTooltip>
                        </StyledEventMarker>
                    );
                })}
                {thresholdY !== undefined ? (
                    <StyledThresholdLabel
                        sx={{
                            top: EVENT_LANE_HEIGHT + thresholdY,
                            color,
                        }}
                    >
                        Threshold {threshold}
                    </StyledThresholdLabel>
                ) : null}
                <StyledSvg
                    viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
                    preserveAspectRatio='none'
                    aria-hidden='true'
                >
                    {[0.25, 0.5, 0.75].map((position) => (
                        <line
                            key={position}
                            x1='0'
                            x2={width}
                            y1={CHART_HEIGHT * position}
                            y2={CHART_HEIGHT * position}
                            stroke='currentColor'
                            strokeOpacity={0.1}
                            strokeWidth={0.75}
                            vectorEffect='non-scaling-stroke'
                        />
                    ))}
                    {thresholdY !== undefined ? (
                        <line
                            x1='0'
                            x2={width}
                            y1={thresholdY}
                            y2={thresholdY}
                            stroke={color}
                            strokeWidth={1}
                            strokeDasharray='3 2'
                            vectorEffect='non-scaling-stroke'
                        />
                    ) : null}
                    <path d={fillPath} fill={color} opacity={0.14} />
                    <path
                        d={linePath}
                        fill='none'
                        stroke={color}
                        strokeWidth={1.75}
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        vectorEffect='non-scaling-stroke'
                        data-testid={testId ? `${testId}_LINE` : undefined}
                    />
                </StyledSvg>
            </StyledChart>
        </StyledCard>
    );
};
