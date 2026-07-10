import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Box, styled, Typography } from '@mui/material';

const TICK_MS = 1000;
const HISTORY_LEN = 40;
const CHART_HEIGHT = 56;
// How fast the current value drifts toward the target on each tick. High
// enough that the reaction to changing config feels immediate.
const SMOOTHING = 0.3;
const JITTER = 2;

const StyledCard = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.75),
    padding: theme.spacing(1.5, 2),
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
}));

const StyledHeader = styled(Box)({
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
});

const StyledLabel = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallerBody,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledValue = styled('span')(({ theme }) => ({
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    fontVariantNumeric: 'tabular-nums',
}));

const StyledSvg = styled('svg')({
    display: 'block',
    width: '100%',
    height: CHART_HEIGHT,
});

type Direction = 'up' | 'down' | 'flat';

const smoothTowards = (last: number, target: number, max: number) => {
    const drift = (target - last) * SMOOTHING;
    const noise = (Math.random() - 0.5) * JITTER;
    return Math.min(max, Math.max(0, last + drift + noise));
};

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

interface IImpactMetricProps {
    label: ReactNode;
    /** The value the sparkline should drift toward on each tick. */
    target: number;
    /**
     * Value used to seed the initial history (before any ticks have run). Pass
     * a "baseline" here to make the chart visibly grow toward `target` after
     * mount instead of starting already at rest at the exposed value. Defaults
     * to `target` (start at rest).
     */
    initialValue?: number;
    /** Upper bound of the internal 0..max scale used for both y-axis and clamp. */
    max: number;
    color: string;
    formatValue: (value: number) => string;
}

/**
 * A small self-contained metric card: a live-updating sparkline that appends a
 * new point every TICK_MS, drifting toward `target`. Owns its own history and
 * interval, so composing many of them (one per country, per variant, etc.) is
 * just a matter of rendering them - each resets cleanly on unmount.
 */
export const ImpactMetric = ({
    label,
    target,
    initialValue,
    max,
    color,
    formatValue,
}: IImpactMetricProps) => {
    const targetRef = useRef(target);
    useEffect(() => {
        targetRef.current = target;
    }, [target]);

    const [history, setHistory] = useState<number[]>(() => {
        const seed = initialValue ?? target;
        return Array.from({ length: HISTORY_LEN }, () => seed);
    });

    useEffect(() => {
        const id = setInterval(() => {
            setHistory((prev) => [
                ...prev.slice(1),
                smoothTowards(prev[prev.length - 1], targetRef.current, max),
            ]);
        }, TICK_MS);
        return () => clearInterval(id);
    }, [max]);

    const now = history[history.length - 1];
    // Compare against a few ticks back so the trend arrow doesn't flicker on
    // per-tick jitter. The threshold scales with `max` so the same relative
    // change reads the same on charts with different y-ranges.
    const prev = history[history.length - 4] ?? now;
    const flatThreshold = max * 0.02;
    const direction: Direction =
        Math.abs(now - prev) < flatThreshold
            ? 'flat'
            : now > prev
              ? 'up'
              : 'down';

    // Render against a max that grows to include any historical peaks. Callers
    // may drop `max` mid-life (e.g. adding a variant shrinks each per-variant
    // chart's expected ceiling); without this, older peaks in the buffer would
    // overflow off the top of the SVG. New values are still clamped to the
    // caller's `max`, so once the peak scrolls out of history the chart
    // settles back to the caller-specified range.
    const renderMax = Math.max(max, ...history);
    const { linePath, fillPath, width } = buildPaths(history, renderMax);
    const arrow = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '·';
    const valueColor = direction === 'flat' ? undefined : color;

    return (
        <StyledCard>
            <StyledHeader>
                <StyledLabel>{label}</StyledLabel>
                <StyledValue style={{ color: valueColor }}>
                    {arrow} {formatValue(now)}
                </StyledValue>
            </StyledHeader>
            <StyledSvg
                viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
                preserveAspectRatio='none'
                aria-hidden='true'
            >
                <path d={fillPath} fill={color} opacity={0.18} />
                <path
                    d={linePath}
                    fill='none'
                    stroke={color}
                    strokeWidth={1.75}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    vectorEffect='non-scaling-stroke'
                />
            </StyledSvg>
        </StyledCard>
    );
};
