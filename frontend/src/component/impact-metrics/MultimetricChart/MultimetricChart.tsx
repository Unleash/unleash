import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import {
    Chart as ChartJS,
    type Chart as ChartInstance,
    type ChartOptions,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { format } from 'date-fns';
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

const withAlpha = (hex: string, alpha: number): string => {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

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

const EVENT_TYPE_LABEL: Record<MultimetricFeatureEvent['type'], string> = {
    'feature-environment-enabled': 'Enabled',
    'feature-environment-disabled': 'Disabled',
};

type VisibleWindow = { minMs: number; maxMs: number; rangeMs: number };

// Parses the Unix-second `start`/`end` strings into a millisecond window.
// Returns `null` when either bound is missing or the range is non-positive,
// which is the signal callers use to skip window-dependent rendering.

const parseVisibleWindow = (
    start: string | undefined,
    end: string | undefined,
): VisibleWindow | null => {
    if (!start || !end) return null;
    const minMs = Number.parseInt(start, 10) * 1000;
    const maxMs = Number.parseInt(end, 10) * 1000;
    const rangeMs = maxMs - minMs;
    if (rangeMs <= 0) return null;
    return { minMs, maxMs, rangeMs };
};

type EventGroup = {
    pct: number;
    events: MultimetricFeatureEvent[];
};

// Collapses events that land within `PROXIMITY_PCT` of each other on the
// x-axis into a single group, so the strip shows one pill instead of a
// cluster of overlapping ones.
const groupEventsByProximity = (
    events: MultimetricFeatureEvent[],
    window: VisibleWindow,
): EventGroup[] => {
    const PROXIMITY_PCT = 3;
    const sorted = [...events].sort(
        (left, right) => left.timestamp - right.timestamp,
    );
    const groups: EventGroup[] = [];
    for (const event of sorted) {
        const pct = ((event.timestamp - window.minMs) / window.rangeMs) * 100;
        const last = groups[groups.length - 1];
        // `sorted` is ascending, so `pct - last.pct` is always >= 0 — no abs needed.
        if (last && pct - last.pct < PROXIMITY_PCT) {
            last.events.push(event);
            last.pct += (pct - last.pct) / last.events.length;
        } else {
            groups.push({ pct, events: [event] });
        }
    }
    return groups;
};

// Builds the Chart.js annotation config that draws one dashed vertical line
// per event group, lined up exactly with the pills on the overlay strip.
const buildEventAnnotations = (
    groups: EventGroup[],
    theme: Theme,
): Record<string, object> =>
    groups.reduce<Record<string, object>>((acc, group, index) => {
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
    }, {});

// Transforms raw step series into the `{ labels, datasets }` shape Chart.js
// expects
const buildTimeSeriesChartData = (
    stepSeries: MultimetricStepSeries[],
    colors: readonly string[],
    hiddenSteps: Set<number>,
) => {
    const allTimestamps = new Set<number>();
    stepSeries.forEach((step) => {
        step.data.forEach(([timestamp]) => {
            allTimestamps.add(timestamp);
        });
    });
    const sortedTimestamps = Array.from(allTimestamps).sort(
        (earlier, later) => earlier - later,
    );
    const labels = sortedTimestamps.map(
        (timestamp) => new Date(timestamp * 1000),
    );

    const datasets = stepSeries.map((step, index) => {
        const valueByTimestamp = new Map(step.data);
        const values = sortedTimestamps.map(
            (timestamp) => valueByTimestamp.get(timestamp) ?? null,
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
            tension: 0.2,
            spanGaps: true,
        };
    });

    return { labels, datasets };
};

// Builds the Chart.js options for the line chart. Pure config — no React, no
// state — so it lives next to the other builders and the component body stays
// focused on orchestration.
const buildChartOptions = (
    window: VisibleWindow | null,
    timeRange: 'hour' | 'day' | 'week' | 'month',
    eventAnnotations: Record<string, object>,
): ChartOptions<'line'> => ({
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    layout: { padding: { top: 28, right: 4, left: 4 } },
    scales: {
        x: {
            type: 'time' as const,
            min: window?.minMs,
            max: window?.maxMs,
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
        annotation: { annotations: eventAnnotations },
    } as ChartOptions<'line'>['plugins'],
    animations: {
        x: { duration: 0 },
        y: { duration: 0 },
    },
});

type PlotArea = { leftPx: number; widthPx: number };

// useChartPlotArea: measures the Chart.js plot area so overlays (the event
// strip) can be positioned to line up exactly with the drawn axes.
const useChartPlotArea = (
    wrapperRef: React.RefObject<HTMLElement>,
    chartRef: React.MutableRefObject<ChartInstance<'line'> | null>,
    invalidateKeys: unknown[],
): PlotArea | null => {
    const [plotArea, setPlotArea] = useState<PlotArea | null>(null);

    const measure = useCallback(() => {
        const wrapper = wrapperRef.current;
        const chart = chartRef.current;
        if (!wrapper || !chart) return;
        const canvasRect = chart.canvas.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();
        const leftPx =
            canvasRect.left - wrapperRect.left + chart.chartArea.left;
        const widthPx = chart.chartArea.right - chart.chartArea.left;
        setPlotArea((prev) => {
            if (
                prev &&
                Math.abs(prev.leftPx - leftPx) < 0.5 &&
                Math.abs(prev.widthPx - widthPx) < 0.5
            ) {
                return prev;
            }
            return { leftPx, widthPx };
        });
    }, [wrapperRef, chartRef]);

    // Chart.js's chartArea is only populated after layout runs, so we defer
    // measurement one frame. Also re-runs on container resize.
    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        let frame = 0;
        const schedule = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(measure);
        };

        const ro = new ResizeObserver(schedule);
        ro.observe(wrapper);
        schedule();

        return () => {
            cancelAnimationFrame(frame);
            ro.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [measure, ...invalidateKeys]);

    return plotArea;
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

const FeatureEventTooltip: FC<{ group: EventGroup }> = ({ group }) => {
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

const FeatureEventMarker: FC<{ group: EventGroup }> = ({ group }) => {
    const theme = useTheme();
    const clampedPct = Math.max(0, Math.min(100, group.pct));
    const primary = group.events[group.events.length - 1];
    const primaryColor = getEventColor(theme, primary.type);
    const isGrouped = group.events.length > 1;

    return (
        <Tooltip
            arrow
            placement='top'
            componentsProps={{
                tooltip: {
                    sx: {
                        bgcolor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        padding: theme.spacing(1.25, 1.5),
                        borderRadius: theme.shape.borderRadiusMedium,
                        boxShadow: theme.shadows[6],
                        border: `1px solid ${theme.palette.divider}`,
                        maxWidth: 320,
                    },
                },
                arrow: {
                    sx: {
                        color: theme.palette.background.paper,
                        '&::before': {
                            border: `1px solid ${theme.palette.divider}`,
                        },
                    },
                },
            }}
            title={<FeatureEventTooltip group={group} />}
        >
            <StyledMarkerWrapper sx={{ left: `${clampedPct}%` }}>
                <StyledMarker
                    sx={{
                        border: `1.5px solid ${primaryColor}`,
                        backgroundColor: withAlpha(primaryColor, 0.12),
                        color: primaryColor,
                    }}
                >
                    <PowerSettingsNewIcon
                        sx={{ fontSize: 13, color: primaryColor }}
                    />
                    {isGrouped && (
                        <StyledMarkerCount sx={{ color: primaryColor }}>
                            {group.events.length}
                        </StyledMarkerCount>
                    )}
                </StyledMarker>
            </StyledMarkerWrapper>
        </Tooltip>
    );
};

// FeatureEventOverlay: absolutely-positioned strip across the top of the plot
// area that hosts all event markers. Positioned to match the Chart.js plot
// bounds so pills line up with the vertical annotation lines underneath.
const FeatureEventOverlay: FC<{
    groups: EventGroup[];
    plotArea: PlotArea;
}> = ({ groups, plotArea }) => (
    <StyledEventStrip
        sx={{
            left: `${plotArea.leftPx}px`,
            width: `${plotArea.widthPx}px`,
            right: 'auto',
        }}
    >
        {groups.map((group) => (
            <FeatureEventMarker key={group.events[0].id} group={group} />
        ))}
    </StyledEventStrip>
);

const StepLegend: FC<{
    stepSeries: MultimetricStepSeries[];
    colors: readonly string[];
    hiddenSteps: Set<number>;
    onToggle: (index: number) => void;
}> = ({ stepSeries, colors, hiddenSteps, onToggle }) => (
    <StyledLegend>
        {stepSeries.map((step, index) => {
            const color = colors[index % colors.length];
            const isHidden = hiddenSteps.has(index);
            return (
                <StyledLegendItem
                    key={step.label}
                    type='button'
                    onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        clickEvent.preventDefault();
                        onToggle(index);
                    }}
                    sx={{
                        opacity: isHidden ? 0.4 : 1,
                        textDecoration: isHidden ? 'line-through' : 'none',
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
);

// MultimetricChart: the orchestrating component. Wires together the Chart.js
// line chart, the feature-event overlay (pills + annotation lines), and the
// clickable step legend.

type MultimetricChartProps = {
    stepSeries: MultimetricStepSeries[];
    timeRange: 'hour' | 'day' | 'week' | 'month';
    start?: string;
    end?: string;
    loading?: boolean;
    featureEvents?: MultimetricFeatureEvent[];
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
    const chartInstanceRef = useRef<ChartInstance<'line'> | null>(null);
    const [hiddenSteps, setHiddenSteps] = useState<Set<number>>(new Set());

    const toggleStep = (index: number) => {
        setHiddenSteps((prev) => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    const placeholderData = usePlaceholderData({
        fill: true,
        type: 'constant',
    });

    const plotArea = useChartPlotArea(wrapperRef, chartInstanceRef, [
        stepSeries,
        hiddenSteps,
    ]);

    const data = buildTimeSeriesChartData(stepSeries, colors, hiddenSteps);

    const hasNoData =
        !loading &&
        (stepSeries.length === 0 ||
            stepSeries.every((step) => step.data.length === 0));

    // `start`/`end` arrive as Unix-second strings; the chart and overlay both
    // need the visible window in milliseconds to place things along the x-axis.
    const window = parseVisibleWindow(start, end);

    const eventGroups = window
        ? groupEventsByProximity(
              featureEvents.filter(
                  (event) =>
                      event.timestamp >= window.minMs &&
                      event.timestamp <= window.maxMs,
              ),
              window,
          )
        : [];

    const eventAnnotations = buildEventAnnotations(eventGroups, theme);
    const chartOptions = buildChartOptions(window, timeRange, eventAnnotations);

    const showOverlay =
        !hasNoData && !loading && window !== null && plotArea !== null;
    const showLegend = !hasNoData && !loading && stepSeries.length > 0;

    // `LineChart`'s `cover` overlays a node on top of the canvas (the empty
    // state) or shows a loading shimmer when given `true`. Otherwise pass
    // `false` so the canvas renders unobstructed.
    const cover = hasNoData ? (
        <NotEnoughData description='Send impact metrics using Unleash SDK for these series to view the chart.' />
    ) : (
        Boolean(loading)
    );

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
                        data={hasNoData || loading ? placeholderData : data}
                        overrideOptions={chartOptions}
                        chartRef={(instance) => {
                            chartInstanceRef.current = instance;
                        }}
                        cover={
                            hasNoData ? (
                                <NotEnoughData description='Send impact metrics using Unleash SDK for these series to view the chart.' />
                            ) : (
                                loading
                            )
                        }
                    />
                </Box>
                {showOverlay && (
                    <FeatureEventOverlay
                        groups={eventGroups}
                        plotArea={plotArea}
                    />
                )}
            </StyledChartArea>
            {showLegend && (
                <StepLegend
                    stepSeries={stepSeries}
                    colors={colors}
                    hiddenSteps={hiddenSteps}
                    onToggle={toggleStep}
                />
            )}
        </StyledWrapper>
    );
};
