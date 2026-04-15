import type { FC } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Box,
    Tooltip,
    Typography,
    styled,
    useTheme,
    type Theme,
} from '@mui/material';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import FlagIcon from '@mui/icons-material/Flag';
import { Chart as ChartJS, type ChartOptions } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { format, fromUnixTime } from 'date-fns';
import {
    LineChart,
    NotEnoughData,
} from '../../insights/components/LineChart/LineChart.tsx';
import { usePlaceholderData } from '../../insights/hooks/usePlaceholderData.js';
import {
    getDisplayFormat,
    getTimeUnit,
    formatLargeNumbers,
} from '../metricsFormatters.js';
import type { MultimetricStepSeries, MultimetricFeatureEvent } from './types';

ChartJS.register(annotationPlugin);

// Global plugin: after layout, store the plot area bounds on the canvas
// element as data attributes so the overlay can measure them.
ChartJS.register({
    id: 'multimetricChartAreaTracker',
    afterLayout: (chart) => {
        const canvas = chart.canvas as HTMLCanvasElement | null;
        if (!canvas) return;
        canvas.dataset.chartAreaLeft = String(chart.chartArea.left);
        canvas.dataset.chartAreaRight = String(chart.chartArea.right);
        canvas.dispatchEvent(
            new CustomEvent('multimetricChartAreaChange', { bubbles: true }),
        );
    },
});

type MultimetricChartProps = {
    stepSeries: MultimetricStepSeries[];
    timeRange: 'hour' | 'day' | 'week' | 'month';
    start?: string;
    end?: string;
    loading?: boolean;
    featureEvents?: MultimetricFeatureEvent[];
};

const withAlpha = (hex: string, alpha: number): string => {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Both event types use shades of the primary purple so the chart reads
// cohesively. Enabled = darker (active), disabled = lighter (muted).
const getEventColor = (
    theme: Theme,
    type: MultimetricFeatureEvent['type'],
): string => {
    switch (type) {
        case 'feature-environment-enabled':
            return theme.palette.primary.dark;
        case 'feature-environment-disabled':
            return theme.palette.primary.light;
    }
};

const EventIcon: FC<{
    type: MultimetricFeatureEvent['type'];
    size?: number;
    color?: string;
}> = ({ type: _type, size = 14, color = '#fff' }) => {
    const iconSx = { fontSize: size, color };
    return <PowerSettingsNewIcon sx={iconSx} />;
};

const StyledWrapper = styled(Box)({
    position: 'relative',
    height: '100%',
    width: '100%',
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
});

const StyledChartArea = styled(Box)({
    position: 'relative',
    flex: 1,
    minHeight: 0,
    width: '100%',
});

const StyledLegend = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5, 1.5),
    paddingTop: theme.spacing(1),
    marginTop: theme.spacing(0.5),
}));

const StyledLegendItem = styled('button')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    padding: theme.spacing(0.25, 0.5),
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: theme.shape.borderRadius,
    fontFamily: 'inherit',
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.primary,
    transition: 'opacity 120ms ease, color 120ms ease',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const StyledLegendSwatch = styled(Box)({
    width: 10,
    height: 10,
    borderRadius: 2,
    flexShrink: 0,
});

const StyledEventStrip = styled(Box)({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 28,
    pointerEvents: 'none',
});

const StyledMarkerWrapper = styled(Box)({
    position: 'absolute',
    top: '50%',
    pointerEvents: 'auto',
    transform: 'translate(-50%, -50%)',
});

// Outlined pill marker — white background with a colored border; the icon and
// count inherit the pill's themed color, keeping the chart calm.
const StyledMarker = styled(Box)(({ theme }) => ({
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    height: 20,
    padding: theme.spacing(0, 0.75),
    borderRadius: 999,
    backgroundColor: theme.palette.background.paper,
    cursor: 'pointer',
    boxShadow: theme.shadows[1],
    transition: 'box-shadow 150ms ease, background-color 150ms ease',
    '&:hover': {
        boxShadow: theme.shadows[3],
    },
}));

const StyledMarkerCount = styled(Typography)({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: '0.02em',
});

// Tooltip styles

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

const EVENT_TYPE_LABEL: Record<MultimetricFeatureEvent['type'], string> = {
    'feature-environment-enabled': 'Enabled',
    'feature-environment-disabled': 'Disabled',
};

export const MultimetricChart: FC<MultimetricChartProps> = ({
    stepSeries,
    timeRange,
    start,
    end,
    loading,
    featureEvents = [],
}) => {
    const theme = useTheme();
    const colors = theme.palette.charts.series;
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [chartArea, setChartArea] = useState<{
        leftPx: number;
        widthPx: number;
    } | null>(null);
    const [hiddenSteps, setHiddenSteps] = useState<Set<number>>(new Set());

    const toggleStep = (index: number) => {
        setHiddenSteps((prev) => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const placeholderData = usePlaceholderData({
        fill: true,
        type: 'constant',
    });

    // Listen for chart layout changes. Chart.js's chartArea is in CSS pixels
    // (not canvas pixels) for the Line component with responsive defaults, so
    // we use it directly without scaling.
    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const update = () => {
            const canvas = wrapper.querySelector(
                'canvas',
            ) as HTMLCanvasElement | null;
            if (!canvas) return;
            const leftData = canvas.dataset.chartAreaLeft;
            const rightData = canvas.dataset.chartAreaRight;
            if (!leftData || !rightData) return;
            const canvasRect = canvas.getBoundingClientRect();
            const wrapperRect = wrapper.getBoundingClientRect();
            const leftPx =
                canvasRect.left - wrapperRect.left + Number(leftData);
            const widthPx = Number(rightData) - Number(leftData);
            setChartArea((prev) => {
                if (
                    prev &&
                    Math.abs(prev.leftPx - leftPx) < 0.5 &&
                    Math.abs(prev.widthPx - widthPx) < 0.5
                ) {
                    return prev;
                }
                return { leftPx, widthPx };
            });
        };

        wrapper.addEventListener('multimetricChartAreaChange', update);
        const ro = new ResizeObserver(update);
        ro.observe(wrapper);
        update();

        return () => {
            wrapper.removeEventListener('multimetricChartAreaChange', update);
            ro.disconnect();
        };
    }, []);

    const data = useMemo(() => {
        const allTimestamps = new Set<number>();
        stepSeries.forEach((step) => {
            step.data.forEach(([ts]) => {
                allTimestamps.add(ts);
            });
        });

        const sortedTimestamps = Array.from(allTimestamps).sort(
            (a, b) => a - b,
        );

        const labels = sortedTimestamps.map((ts) => new Date(ts * 1000));

        const datasets = stepSeries.map((step, index) => {
            const dataMap = new Map(step.data);
            const values = sortedTimestamps.map(
                (ts) => dataMap.get(ts) ?? null,
            );
            const color = colors[index % colors.length];
            return {
                label: step.label,
                data: values,
                hidden: hiddenSteps.has(index),
                borderColor: color,
                backgroundColor: withAlpha(color, 0.12),
                fill: true,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: color,
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
                tension: 0.3,
                spanGaps: true,
            };
        });

        return { labels, datasets };
    }, [stepSeries, colors, hiddenSteps]);

    const notEnoughData = useMemo(() => {
        if (loading) return false;
        if (stepSeries.length === 0) return true;
        return stepSeries.every((s) => s.data.length === 0);
    }, [stepSeries, loading]);

    const minTime = start
        ? fromUnixTime(Number.parseInt(start, 10))
        : undefined;
    const maxTime = end ? fromUnixTime(Number.parseInt(end, 10)) : undefined;

    const visibleEvents = useMemo(() => {
        const minMs = minTime?.getTime();
        const maxMs = maxTime?.getTime();
        return featureEvents.filter((event) => {
            if (minMs !== undefined && event.timestamp < minMs) return false;
            if (maxMs !== undefined && event.timestamp > maxMs) return false;
            return true;
        });
    }, [featureEvents, minTime, maxTime]);

    const minMs = minTime?.getTime();
    const maxMs = maxTime?.getTime();
    const rangeMs =
        minMs !== undefined && maxMs !== undefined ? maxMs - minMs : 0;

    const eventGroups = useMemo(() => {
        if (rangeMs <= 0)
            return [] as { pct: number; events: MultimetricFeatureEvent[] }[];
        const PROXIMITY_PCT = 3;
        const sorted = [...visibleEvents].sort(
            (a, b) => a.timestamp - b.timestamp,
        );
        const groups: { pct: number; events: MultimetricFeatureEvent[] }[] = [];
        for (const event of sorted) {
            const pct = ((event.timestamp - (minMs ?? 0)) / rangeMs) * 100;
            const last = groups[groups.length - 1];
            if (last && Math.abs(pct - last.pct) < PROXIMITY_PCT) {
                last.events.push(event);
                last.pct =
                    last.events.reduce(
                        (sum, e) =>
                            sum +
                            ((e.timestamp - (minMs ?? 0)) / rangeMs) * 100,
                        0,
                    ) / last.events.length;
            } else {
                groups.push({ pct, events: [event] });
            }
        }
        return groups;
    }, [visibleEvents, minMs, rangeMs]);

    // One dashed vertical line per group (matches the pills exactly)
    const eventAnnotations = useMemo(() => {
        return eventGroups.reduce<Record<string, object>>(
            (acc, group, index) => {
                const primary = group.events[group.events.length - 1];
                const color = getEventColor(theme, primary.type);
                acc[`event-line-${index}`] = {
                    type: 'line',
                    xMin: primary.timestamp,
                    xMax: primary.timestamp,
                    borderColor: color,
                    borderWidth: 1.5,
                    borderDash: [4, 3],
                };
                return acc;
            },
            {},
        );
    }, [eventGroups, theme]);

    const chartOptions: ChartOptions<'line'> = {
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        layout: {
            padding: { top: 28, right: 4, left: 4 },
        },
        scales: {
            x: {
                type: 'time' as const,
                min: minTime?.getTime(),
                max: maxTime?.getTime(),
                time: {
                    unit: getTimeUnit(timeRange),
                    displayFormats: {
                        [getTimeUnit(timeRange)]: getDisplayFormat(timeRange),
                    },
                    tooltipFormat: 'PPpp',
                },
                ticks: {
                    maxRotation: 0,
                    maxTicksLimit: 6,
                    font: { size: 10 },
                },
                grid: { display: false },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                    maxTicksLimit: 4,
                    font: { size: 10 },
                    callback: (value: unknown): string | number =>
                        typeof value === 'number'
                            ? formatLargeNumbers(value)
                            : (value as number),
                },
            },
        },
        plugins: {
            legend: { display: false },
            annotation: {
                annotations: eventAnnotations,
            },
        } as ChartOptions<'line'>['plugins'],
        animations: {
            x: { duration: 0 },
            y: { duration: 0 },
        },
    };

    return (
        <StyledWrapper ref={wrapperRef}>
            <StyledChartArea>
                <Box
                    sx={{
                        height: '100%',
                        width: '100%',
                        minHeight: 0,
                        '& > div': {
                            height: '100% !important',
                            width: '100% !important',
                        },
                    }}
                >
                    <LineChart
                        data={notEnoughData || loading ? placeholderData : data}
                        overrideOptions={chartOptions}
                        cover={
                            notEnoughData ? (
                                <NotEnoughData description='Send impact metrics using Unleash SDK for these series to view the chart.' />
                            ) : (
                                loading
                            )
                        }
                    />
                </Box>
                {!notEnoughData && !loading && rangeMs > 0 && chartArea && (
                    <StyledEventStrip
                        sx={{
                            left: `${chartArea.leftPx}px`,
                            width: `${chartArea.widthPx}px`,
                            right: 'auto',
                        }}
                    >
                        {eventGroups.map((group, groupIndex) => {
                            const clampedPct = Math.max(
                                0,
                                Math.min(100, group.pct),
                            );
                            const primary =
                                group.events[group.events.length - 1];
                            const primaryColor = getEventColor(
                                theme,
                                primary.type,
                            );
                            const isGrouped = group.events.length > 1;
                            return (
                                <Tooltip
                                    key={`event-group-${groupIndex}`}
                                    arrow
                                    placement='top'
                                    componentsProps={{
                                        tooltip: {
                                            sx: {
                                                bgcolor:
                                                    theme.palette.background
                                                        .paper,
                                                color: theme.palette.text
                                                    .primary,
                                                padding: theme.spacing(
                                                    1.25,
                                                    1.5,
                                                ),
                                                borderRadius:
                                                    theme.shape
                                                        .borderRadiusMedium,
                                                boxShadow: theme.shadows[6],
                                                border: `1px solid ${theme.palette.divider}`,
                                                maxWidth: 320,
                                            },
                                        },
                                        arrow: {
                                            sx: {
                                                color: theme.palette.background
                                                    .paper,
                                                '&::before': {
                                                    border: `1px solid ${theme.palette.divider}`,
                                                },
                                            },
                                        },
                                    }}
                                    title={
                                        <StyledTooltipContent>
                                            <StyledTooltipHeader>
                                                <FlagIcon
                                                    sx={{
                                                        fontSize: 12,
                                                        color: 'inherit',
                                                    }}
                                                />
                                                {isGrouped
                                                    ? `${group.events.length} events in production`
                                                    : 'Production'}
                                            </StyledTooltipHeader>
                                            {group.events.map((event) => {
                                                const eventColor =
                                                    getEventColor(
                                                        theme,
                                                        event.type,
                                                    );
                                                const isDisabled =
                                                    event.type ===
                                                    'feature-environment-disabled';
                                                return (
                                                    <StyledEventRow
                                                        key={event.id}
                                                    >
                                                        <StyledEventIconBadge
                                                            sx={{
                                                                backgroundColor:
                                                                    eventColor,
                                                                opacity:
                                                                    isDisabled
                                                                        ? 0.5
                                                                        : 1,
                                                            }}
                                                        >
                                                            <EventIcon
                                                                type={
                                                                    event.type
                                                                }
                                                                size={12}
                                                            />
                                                        </StyledEventIconBadge>
                                                        <StyledEventMeta>
                                                            <StyledEventLabel>
                                                                {
                                                                    EVENT_TYPE_LABEL[
                                                                        event
                                                                            .type
                                                                    ]
                                                                }
                                                            </StyledEventLabel>
                                                            <StyledEventSubtext>
                                                                {format(
                                                                    new Date(
                                                                        event.timestamp,
                                                                    ),
                                                                    'MMM d, HH:mm',
                                                                )}
                                                                {' · '}
                                                                {
                                                                    event.createdBy
                                                                }
                                                            </StyledEventSubtext>
                                                        </StyledEventMeta>
                                                    </StyledEventRow>
                                                );
                                            })}
                                        </StyledTooltipContent>
                                    }
                                >
                                    <StyledMarkerWrapper
                                        sx={{ left: `${clampedPct}%` }}
                                    >
                                        <StyledMarker
                                            sx={{
                                                border: `1.5px solid ${primaryColor}`,
                                                backgroundColor: withAlpha(
                                                    primaryColor,
                                                    0.12,
                                                ),
                                                color: primaryColor,
                                            }}
                                        >
                                            <EventIcon
                                                type={primary.type}
                                                size={13}
                                                color={primaryColor}
                                            />
                                            {isGrouped && (
                                                <StyledMarkerCount
                                                    sx={{ color: primaryColor }}
                                                >
                                                    {group.events.length}
                                                </StyledMarkerCount>
                                            )}
                                        </StyledMarker>
                                    </StyledMarkerWrapper>
                                </Tooltip>
                            );
                        })}
                    </StyledEventStrip>
                )}
            </StyledChartArea>
            {!notEnoughData && !loading && stepSeries.length > 0 && (
                <StyledLegend>
                    {stepSeries.map((step, index) => {
                        const color = colors[index % colors.length];
                        const isHidden = hiddenSteps.has(index);
                        return (
                            <StyledLegendItem
                                key={`legend-${step.label}-${index}`}
                                type='button'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    toggleStep(index);
                                }}
                                sx={{
                                    opacity: isHidden ? 0.4 : 1,
                                    textDecoration: isHidden
                                        ? 'line-through'
                                        : 'none',
                                }}
                            >
                                <StyledLegendSwatch
                                    sx={{
                                        backgroundColor: isHidden
                                            ? 'action.disabled'
                                            : color,
                                    }}
                                />
                                {step.label}
                            </StyledLegendItem>
                        );
                    })}
                </StyledLegend>
            )}
        </StyledWrapper>
    );
};
