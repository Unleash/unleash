import { Suspense, useMemo, type FC } from 'react';
import {
    Box,
    Dialog,
    IconButton,
    styled,
    Typography,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { format, formatDistanceToNow } from 'date-fns';
import { LineChart } from 'component/insights/components/LineChart/LineChart';
import { formatLargeNumbers } from 'component/impact-metrics/metricsFormatters';
import {
    EVENT_TYPE_LABEL,
    getEventColor,
} from 'component/impact-metrics/MultimetricChart/FeatureEventOverlay/eventTheme';
// Importing from chartConfig registers `chartjs-plugin-annotation` as a side
// effect, which the mini chart relies on for the vertical event line.
import { withAlpha } from 'component/impact-metrics/MultimetricChart/chartConfig';
import type { AggregationMode } from 'component/impact-metrics/types';
import type { FlagEventImpact } from './computeFlagEventImpact';
import { formatHalfWindow, formatPct, toneOf } from './flagImpactFormatting';

// Cumulative goal modes — captions read "Sum of the goal…" rather than
// "Average of the goal…" so the math is legible at the point of reading.
const SUM_MODES: ReadonlySet<AggregationMode> = new Set(['count', 'sum']);

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusLarge,
        overflow: 'hidden',
    },
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing(1.5),
    padding: theme.spacing(2.5, 3, 1.5, 3),
}));

const StyledHeaderLeft = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    minWidth: 0,
}));

const StyledFlagRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    minWidth: 0,
}));

const StyledFlagName = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 700,
    color: theme.palette.text.primary,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
}));

const StyledEventPill = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.25, 1),
    borderRadius: 999,
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: 600,
    flexShrink: 0,
}));

const StyledSubline = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

const StyledBody = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 3, 3, 3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
}));

// Δ panel — stacked top-to-bottom: a quiet BEFORE → AFTER row up top, the
// headline Δ% in trend color centered below it. No per-side captions and no
// repeated "goal change" label; the panel itself reads as "this is the Δ".
const StyledDeltaPanel = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.background.elevation1,
}));

const StyledSidesRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'baseline',
    gap: theme.spacing(2.5),
    color: theme.palette.text.secondary,
}));

const StyledSide = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
});

const StyledSideLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: 600,
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
}));

const StyledSideValue = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 600,
    color: theme.palette.text.primary,
    lineHeight: 1.2,
}));

const StyledArrow = styled(Box)(({ theme }) => ({
    color: theme.palette.text.disabled,
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 300,
    alignSelf: 'center',
    paddingBottom: theme.spacing(0.5),
}));

const StyledDeltaBlock = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'tone',
})<{ tone: 'up' | 'down' | 'flat' }>(({ theme, tone }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(0.25),
    color:
        tone === 'up'
            ? theme.palette.success.main
            : tone === 'down'
              ? theme.palette.error.main
              : theme.palette.text.secondary,
}));

const StyledDeltaValue = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h1.fontSize,
    fontWeight: 700,
    lineHeight: 1.1,
    color: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const StyledDeltaSecondary = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

const StyledChartSection = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledChartSectionTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: 700,
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
}));

const StyledChartBox = styled(Box)({
    position: 'relative',
    height: 220,
});

const StyledFootnote = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
}));

const formatAbs = (deltaAbs: number): string => {
    const sign = deltaAbs > 0 ? '+' : deltaAbs < 0 ? '\u2212' : '';
    return `${sign}${formatLargeNumbers(Math.abs(deltaAbs))}`;
};

// Builds the LineChart-shaped `data` payload for the mini chart. Combines the
// pre and post sub-series into a single dataset so the line reads as one
// continuous curve interrupted by the event marker.
const buildMiniChartData = (
    impact: FlagEventImpact,
    seriesColor: string,
    fillTopColor: string,
    fillBottomColor: string,
) => {
    const combined: [number, number][] = [
        ...impact.preSeries,
        ...impact.postSeries,
    ].sort(([leftTs], [rightTs]) => leftTs - rightTs);
    return {
        labels: combined.map(([tsSec]) => new Date(tsSec * 1000)),
        datasets: [
            {
                label: 'Goal',
                data: combined.map(([, value]) => value),
                borderColor: seriesColor,
                backgroundColor: (ctx: {
                    chart: {
                        ctx: CanvasRenderingContext2D;
                        chartArea?: { top: number; bottom: number };
                    };
                }) => {
                    const { chart } = ctx;
                    if (!chart.chartArea) return fillBottomColor;
                    const gradient = chart.ctx.createLinearGradient(
                        0,
                        chart.chartArea.bottom,
                        0,
                        chart.chartArea.top,
                    );
                    gradient.addColorStop(0, fillBottomColor);
                    gradient.addColorStop(1, fillTopColor);
                    return gradient;
                },
                fill: true,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                tension: 0.2,
                spanGaps: true,
            },
        ],
    };
};

const buildMiniChartOptions = (
    impact: FlagEventImpact,
    eventLineColor: string,
    preTintColor: string,
) => {
    const eventMs = impact.event.timestamp;
    const halfWindowMs = impact.halfWindowMs;
    return {
        maintainAspectRatio: false,
        responsive: true,
        interaction: { mode: 'index' as const, intersect: false },
        layout: { padding: { top: 12, right: 8, left: 8, bottom: 4 } },
        scales: {
            x: {
                type: 'time' as const,
                min: eventMs - halfWindowMs,
                max: eventMs + halfWindowMs,
                ticks: {
                    maxRotation: 0,
                    maxTicksLimit: 5,
                    font: { size: 10 },
                },
                grid: { display: false },
            },
            y: {
                beginAtZero: false,
                ticks: {
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
                annotations: {
                    'pre-tint': {
                        type: 'box' as const,
                        xMin: eventMs - halfWindowMs,
                        xMax: eventMs,
                        backgroundColor: preTintColor,
                        borderWidth: 0,
                        drawTime: 'beforeDatasetsDraw' as const,
                    },
                    'event-line': {
                        type: 'line' as const,
                        xMin: eventMs,
                        xMax: eventMs,
                        borderColor: eventLineColor,
                        borderWidth: 2,
                        borderDash: [4, 3],
                    },
                },
            },
        },
        animations: {
            x: { duration: 0 },
            y: { duration: 0 },
        },
    };
};

export type FlagImpactDialogProps = {
    impact: FlagEventImpact | null;
    aggregationMode: AggregationMode;
    onClose: () => void;
};

export const FlagImpactDialog: FC<FlagImpactDialogProps> = ({
    impact,
    aggregationMode,
    onClose,
}) => {
    const theme = useTheme();

    const open = impact !== null;
    const isSumMode = SUM_MODES.has(aggregationMode);

    const tone = useMemo(() => (impact ? toneOf(impact) : 'flat'), [impact]);

    const eventColor = impact
        ? getEventColor(theme, impact.event.type)
        : theme.palette.text.secondary;

    const chartData = useMemo(
        () =>
            impact
                ? buildMiniChartData(
                      impact,
                      theme.palette.primary.main,
                      withAlpha(theme.palette.primary.main, 0),
                      withAlpha(theme.palette.primary.main, 0.18),
                  )
                : null,
        [impact, theme.palette.primary.main],
    );

    const chartOptions = useMemo(
        () =>
            impact
                ? buildMiniChartOptions(
                      impact,
                      theme.palette.primary.main,
                      withAlpha(theme.palette.text.primary, 0.04),
                  )
                : null,
        [impact, theme.palette.primary.main, theme.palette.text.primary],
    );

    if (!impact) {
        // Returning the closed Dialog (rather than null) lets MUI run its
        // exit animation when the parent flips `impact` to null.
        return (
            <StyledDialog
                open={open}
                onClose={onClose}
                maxWidth='sm'
                fullWidth
            />
        );
    }

    const TrendIcon =
        tone === 'up'
            ? TrendingUpIcon
            : tone === 'down'
              ? TrendingDownIcon
              : TrendingFlatIcon;

    const featureLabel = impact.event.featureName ?? impact.event.label;
    const happenedAt = formatDistanceToNow(new Date(impact.event.timestamp), {
        addSuffix: true,
    });
    const absoluteTimestamp = format(
        new Date(impact.event.timestamp),
        "MMM d 'at' HH:mm",
    );

    const windowLabel = `±${formatHalfWindow(impact.halfWindowMs)} around the flip`;
    const sideCaption = isSumMode
        ? `Sum of the goal · ${windowLabel}`
        : `Average of the goal · ${windowLabel}`;

    const measurable = impact.preValue !== null && impact.postValue !== null;
    const footnote = measurable
        ? 'Compared like-for-like over equal-length windows on either side of the flip.'
        : 'Not enough data on one side of the flip to compute a comparable Δ.';

    return (
        <StyledDialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
            <StyledHeader>
                <StyledHeaderLeft>
                    <StyledFlagRow>
                        <StyledFlagName title={featureLabel}>
                            {featureLabel}
                        </StyledFlagName>
                        <StyledEventPill
                            sx={{
                                backgroundColor: withAlpha(eventColor, 0.14),
                                color: eventColor,
                                border: `1px solid ${eventColor}`,
                            }}
                        >
                            <PowerSettingsNewIcon
                                sx={{ fontSize: 12, color: 'inherit' }}
                            />
                            {EVENT_TYPE_LABEL[impact.event.type]}
                        </StyledEventPill>
                    </StyledFlagRow>
                    <StyledSubline title={absoluteTimestamp}>
                        Flipped {happenedAt}
                        {impact.event.createdBy
                            ? ` by ${impact.event.createdBy}`
                            : ''}
                    </StyledSubline>
                </StyledHeaderLeft>
                <IconButton aria-label='Close' size='small' onClick={onClose}>
                    <CloseIcon fontSize='small' />
                </IconButton>
            </StyledHeader>
            <StyledBody>
                <StyledDeltaPanel>
                    <StyledSidesRow>
                        <StyledSide>
                            <StyledSideLabel>Before</StyledSideLabel>
                            <StyledSideValue>
                                {impact.preValue === null
                                    ? '\u2014'
                                    : formatLargeNumbers(impact.preValue)}
                            </StyledSideValue>
                        </StyledSide>
                        <StyledArrow>{'\u2192'}</StyledArrow>
                        <StyledSide>
                            <StyledSideLabel>After</StyledSideLabel>
                            <StyledSideValue>
                                {impact.postValue === null
                                    ? '\u2014'
                                    : formatLargeNumbers(impact.postValue)}
                            </StyledSideValue>
                        </StyledSide>
                    </StyledSidesRow>
                    <StyledDeltaBlock tone={tone}>
                        <StyledDeltaValue>
                            <TrendIcon sx={{ fontSize: 28 }} />
                            {impact.deltaPct === null
                                ? impact.deltaAbs === null
                                    ? '\u2014'
                                    : formatAbs(impact.deltaAbs)
                                : formatPct(impact.deltaPct)}
                        </StyledDeltaValue>
                        <StyledDeltaSecondary>
                            {impact.deltaAbs !== null &&
                            impact.deltaPct !== null
                                ? `${formatAbs(impact.deltaAbs)} \u00B7 ${sideCaption}`
                                : sideCaption}
                        </StyledDeltaSecondary>
                    </StyledDeltaBlock>
                </StyledDeltaPanel>
                <StyledChartSection>
                    <StyledChartSectionTitle>
                        Goal around the flip
                    </StyledChartSectionTitle>
                    <StyledChartBox>
                        {chartData && chartOptions ? (
                            <Suspense fallback={null}>
                                <LineChart
                                    data={chartData}
                                    overrideOptions={chartOptions}
                                    aspectRatio={2.5}
                                />
                            </Suspense>
                        ) : null}
                    </StyledChartBox>
                </StyledChartSection>
                {measurable ? null : (
                    <StyledFootnote>{footnote}</StyledFootnote>
                )}
            </StyledBody>
        </StyledDialog>
    );
};
