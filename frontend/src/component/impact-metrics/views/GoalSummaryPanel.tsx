import { useId, type FC } from 'react';
import { Box, styled, Typography, useTheme } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import { formatLargeNumbers } from 'component/impact-metrics/metricsFormatters';
import type { MultimetricStepSeries } from 'component/impact-metrics/MultimetricChart/types';
import type { GoalSummary } from './computeGoalSummary';

// SVG viewBox dimensions — the actual rendered size is driven by the parent
// container (the right column of the two-column body). Keeping the viewBox
// aspect close to the rendered aspect avoids visible stretching of the line.
const SPARKLINE_WIDTH = 320;
const SPARKLINE_HEIGHT = 64;

const StyledRoot = styled(Box)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    // Fill the slot's full height so the goal section matches the height of
    // the other rail sections (Top Movers, Signals) when the chart stretches
    // the card. The body's `justify-content: center` then re-centers the
    // content within that taller area instead of leaving empty space below.
    flex: 1,
    justifyContent: 'center',
    // Tight gap between the "GOAL" label and the metric name below it — they
    // read as a single header block rather than two stacked elements.
    gap: theme.spacing(0.5),
    // Bleed into the wrapping slot's padding so the purple background covers
    // the entire goal section, including the surrounding padding.
    margin: theme.spacing(-3, -3, -3, -3),
    padding: theme.spacing(4, 3, 4, 3),
    borderTopRightRadius: theme.shape.borderRadiusMedium,
    // In light mode the gradient uses the brand primary. In dark mode the
    // primary palette collapses to a single washed-out periwinkle that reads
    // as flat and low-contrast against the rail. The Unleash theme exposes
    // its current mode at `theme.mode` (top-level, not `palette.mode`), so
    // we branch on that to swap in deep saturated purple slots
    // (`background.alternative` → `action.alternative`) for dark mode.
    background:
        theme.mode === 'dark'
            ? `linear-gradient(135deg, ${theme.palette.background.alternative} 0%, ${theme.palette.action.alternative} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: theme.palette.common.white,
    overflow: 'hidden',
    [theme.breakpoints.down('lg')]: {
        margin: theme.spacing(-2.5, -2, -2.5, -2),
        padding: theme.spacing(3.5, 2, 3.5, 2),
        borderTopRightRadius: 0,
    },
}));

// Two-column body: text summary on the left, a wide sparkline on the right.
// `alignItems: stretch` lets the sparkline match the left column's height —
// without it, the chart sits centered in a sea of purple while the text
// stack defines a much taller block. Stacks vertically on narrower viewports
// so the sparkline never crushes the summary text.
const StyledBody = styled(Box)(({ theme }) => ({
    display: 'grid',
    // Left column claims most of the room so long metric identifiers stay on
    // one line. The sparkline keeps a generous floor (140px) and gives up
    // extra width when the name needs it.
    gridTemplateColumns: 'minmax(0, 1fr) minmax(140px, 0.6fr)',
    gap: theme.spacing(2.5),
    alignItems: 'stretch',
    [theme.breakpoints.down('md')]: {
        gridTemplateColumns: '1fr',
        gap: theme.spacing(1.5),
        alignItems: 'center',
    },
}));

const StyledSummary = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    minWidth: 0,
}));

const StyledSparklineBox = styled(Box)(({ theme }) => ({
    width: '100%',
    // Inherits height from the grid row when stretched; falls back to a
    // sensible floor when the row's intrinsic height is small.
    minHeight: SPARKLINE_HEIGHT,
    display: 'flex',
    alignItems: 'stretch',
    [theme.breakpoints.down('md')]: {
        height: SPARKLINE_HEIGHT * 0.7,
        minHeight: 'unset',
    },
}));

const StyledLabelRow = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    color: theme.palette.common.white,
}));

const StyledLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.common.white,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
}));

const StyledMetricName = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.common.white,
    lineHeight: 1.3,
    // Prefer one line, but allow a second line as a fallback for very long
    // Prometheus identifiers rather than truncating with an ellipsis. Only
    // truncates if the name needs a third line, which is extremely rare.
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    overflowWrap: 'anywhere',
}));

const StyledValueRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'baseline',
    gap: theme.spacing(1),
    // Extra top spacing so the metric name reads as the field label for the
    // value below it, with clear visual separation between the two.
    marginTop: theme.spacing(1.5),
}));

const StyledValue = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 700,
    color: theme.palette.common.white,
    lineHeight: 1,
}));

const StyledDeltaRow = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    fontSize: theme.fontSizes.smallBody,
}));

const StyledCaption = styled(Typography)(() => ({
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: '0.75rem',
}));

const StyledSparkline = styled('svg')({
    width: '100%',
    height: '100%',
    display: 'block',
});

type Trend = 'up' | 'down' | 'flat';

const trendOf = (deltaAbs: number | null): Trend => {
    if (deltaAbs === null || deltaAbs === 0) return 'flat';
    if (deltaAbs > 0) return 'up';
    return 'down';
};

const formatPct = (pct: number): string => {
    const sign = pct > 0 ? '+' : '';
    const formatted = Number.isInteger(pct) ? `${pct}` : pct.toFixed(1);
    return `${sign}${formatted}%`;
};

const formatAbsoluteDelta = (deltaAbs: number): string => {
    const sign = deltaAbs > 0 ? '+' : deltaAbs < 0 ? '\u2212' : '';
    return `${sign}${formatLargeNumbers(Math.abs(deltaAbs))}`;
};

type SparklinePaths = { line: string; area: string };

// Builds line and filled-area SVG paths for a sparkline that fits the series
// data into the fixed width/height. Returns null when there aren't at least
// two finite points.
const buildSparklinePaths = (
    series: MultimetricStepSeries,
): SparklinePaths | null => {
    const finitePoints: [number, number][] = series.data.filter(([, value]) =>
        Number.isFinite(value),
    );
    if (finitePoints.length < 2) return null;

    const values = finitePoints.map(([, value]) => value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue;

    const firstTs = finitePoints[0][0];
    const lastTs = finitePoints[finitePoints.length - 1][0];
    const tsRange = lastTs - firstTs;

    // Leave a sliver of headroom so the stroke doesn't get clipped at the top.
    const verticalPadding = 2;
    const drawableHeight = SPARKLINE_HEIGHT - verticalPadding * 2;

    const xFor = (ts: number): number =>
        tsRange === 0
            ? SPARKLINE_WIDTH / 2
            : ((ts - firstTs) / tsRange) * SPARKLINE_WIDTH;

    const yFor = (value: number): number => {
        if (valueRange === 0) return SPARKLINE_HEIGHT / 2;
        // Inverted because SVG y grows downward.
        return (
            verticalPadding +
            drawableHeight -
            ((value - minValue) / valueRange) * drawableHeight
        );
    };

    const linePoints = finitePoints.map(
        ([ts, value], index) =>
            `${index === 0 ? 'M' : 'L'} ${xFor(ts).toFixed(1)} ${yFor(value).toFixed(1)}`,
    );
    const line = linePoints.join(' ');

    const firstX = xFor(firstTs).toFixed(1);
    const lastX = xFor(lastTs).toFixed(1);
    const area = `${line} L ${lastX} ${SPARKLINE_HEIGHT} L ${firstX} ${SPARKLINE_HEIGHT} Z`;

    return { line, area };
};

export type GoalSummaryPanelProps = {
    goalMetricLabel: string;
    summary: GoalSummary;
    series: MultimetricStepSeries | undefined;
    timeLabel: string;
};

export const GoalSummaryPanel: FC<GoalSummaryPanelProps> = ({
    goalMetricLabel,
    summary,
    series,
    timeLabel,
}) => {
    const theme = useTheme();
    const gradientId = useId();
    const trend = trendOf(summary.deltaAbs);
    const sparklinePaths = series ? buildSparklinePaths(series) : null;
    const showDelta =
        summary.mode === 'latest' &&
        summary.deltaAbs !== null &&
        summary.deltaAbs !== 0;

    // Inside the purple panel, everything is white. Trend direction is conveyed
    // by the arrow icon rather than red/green coloring, which would clash.
    const trendColor = theme.palette.common.white;
    const sparklineColor = theme.palette.common.white;

    const TrendIcon =
        trend === 'up'
            ? TrendingUpIcon
            : trend === 'down'
              ? TrendingDownIcon
              : TrendingFlatIcon;

    const caption =
        summary.mode === 'cumulative'
            ? `Total over ${timeLabel.toLowerCase()}`
            : `vs. start of ${timeLabel.toLowerCase()}`;

    return (
        <StyledRoot>
            <StyledLabelRow>
                <FlagOutlinedIcon sx={{ fontSize: 16 }} />
                <StyledLabel>Goal</StyledLabel>
            </StyledLabelRow>
            <StyledBody>
                <StyledSummary>
                    <StyledMetricName title={goalMetricLabel}>
                        {goalMetricLabel}
                    </StyledMetricName>
                    <StyledValueRow>
                        <StyledValue>
                            {formatLargeNumbers(summary.current)}
                        </StyledValue>
                        {showDelta && summary.deltaAbs !== null ? (
                            <StyledDeltaRow sx={{ color: trendColor }}>
                                <TrendIcon sx={{ fontSize: 16 }} />
                                <Typography
                                    component='span'
                                    sx={{
                                        fontSize: 'inherit',
                                        fontWeight: 600,
                                        color: 'inherit',
                                    }}
                                >
                                    {summary.deltaPct === null
                                        ? formatAbsoluteDelta(summary.deltaAbs)
                                        : `${formatPct(summary.deltaPct)} (${formatAbsoluteDelta(summary.deltaAbs)})`}
                                </Typography>
                            </StyledDeltaRow>
                        ) : null}
                    </StyledValueRow>
                    <StyledCaption variant='caption'>{caption}</StyledCaption>
                </StyledSummary>
                {sparklinePaths ? (
                    <StyledSparklineBox>
                        <StyledSparkline
                            viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
                            preserveAspectRatio='none'
                            role='img'
                            aria-label={`${goalMetricLabel} trend sparkline`}
                        >
                            <defs>
                                <linearGradient
                                    id={gradientId}
                                    x1='0'
                                    y1='0'
                                    x2='0'
                                    y2='1'
                                >
                                    <stop
                                        offset='0%'
                                        stopColor={sparklineColor}
                                        stopOpacity={0.35}
                                    />
                                    <stop
                                        offset='100%'
                                        stopColor={sparklineColor}
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <path
                                d={sparklinePaths.area}
                                fill={`url(#${gradientId})`}
                                stroke='none'
                            />
                            {/* Non-scaling-stroke keeps the line at a
                                consistent visual weight regardless of the
                                viewBox-to-pixel stretch. */}
                            <path
                                d={sparklinePaths.line}
                                fill='none'
                                stroke={sparklineColor}
                                strokeWidth={1.5}
                                strokeLinejoin='round'
                                strokeLinecap='round'
                                vectorEffect='non-scaling-stroke'
                            />
                        </StyledSparkline>
                    </StyledSparklineBox>
                ) : null}
            </StyledBody>
        </StyledRoot>
    );
};
