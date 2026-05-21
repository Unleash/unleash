import { useId, type FC } from 'react';
import { Box, styled, Typography, useTheme } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import { formatLargeNumbers } from 'component/impact-metrics/metricsFormatters';
import type { MultimetricStepSeries } from 'component/impact-metrics/MultimetricChart/types';
import type { GoalSummary } from './computeGoalSummary';

const SPARKLINE_WIDTH = 180;
const SPARKLINE_HEIGHT = 44;

const StyledRoot = styled(Box)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.75),
    // Bleed into the wrapping slot's padding so the purple background covers
    // the entire goal section, including the surrounding padding.
    margin: theme.spacing(-3, -3, -3, -3),
    padding: theme.spacing(3, 3, 3, 3),
    borderTopRightRadius: theme.shape.borderRadiusMedium,
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: theme.palette.common.white,
    overflow: 'hidden',
    [theme.breakpoints.down('lg')]: {
        margin: theme.spacing(-2.5, -2, -2.5, -2),
        padding: theme.spacing(2.5, 2, 2.5, 2),
        borderTopRightRadius: 0,
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
    color: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
}));

const StyledValueRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'baseline',
    gap: theme.spacing(1),
    marginTop: theme.spacing(0.25),
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

const StyledSparkline = styled('svg')(({ theme }) => ({
    width: '100%',
    maxWidth: SPARKLINE_WIDTH,
    height: SPARKLINE_HEIGHT,
    marginTop: theme.spacing(1),
    display: 'block',
}));

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
            <StyledMetricName title={goalMetricLabel}>
                {goalMetricLabel}
            </StyledMetricName>
            <StyledValueRow>
                <StyledValue>{formatLargeNumbers(summary.current)}</StyledValue>
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
            {sparklinePaths ? (
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
                                stopOpacity={0.55}
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
                    <path
                        d={sparklinePaths.line}
                        fill='none'
                        stroke={sparklineColor}
                        strokeWidth={1.75}
                        strokeLinejoin='round'
                        strokeLinecap='round'
                    />
                </StyledSparkline>
            ) : null}
        </StyledRoot>
    );
};
