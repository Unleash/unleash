import type { MultimetricStepSeries } from 'component/impact-metrics/MultimetricChart/types';

export const SPARKLINE_WIDTH = 320;
export const SPARKLINE_HEIGHT = 64;

// Vertical breathing room (px, top and bottom) so the stroke isn't clipped at
// the edges of the viewBox.
const VERTICAL_PADDING = 2;

export type SparklinePaths = {
    // SVG path `d` for the trend line.
    line: string;
    // SVG path `d` for the filled area under the line (line + baseline close).
    area: string;
};

// Maps a value from one numeric range onto another. When the input range is
// empty (min === max) there is no meaningful position, so we return the
// midpoint of the output range — a flat line / centered point.
const scale = (
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number,
): number => {
    if (inMax === inMin) return (outMin + outMax) / 2;
    const ratio = (value - inMin) / (inMax - inMin);
    return outMin + ratio * (outMax - outMin);
};

/**
 * Builds the SVG path strings for a sparkline that fits `series` into the
 * fixed SPARKLINE_WIDTH x SPARKLINE_HEIGHT viewBox.
 *
 * - Non-finite values are dropped.
 * - Returns `null` when fewer than two finite points remain (nothing to draw).
 * - A flat series (all equal values) renders as a horizontal line through the
 *   vertical centre; a single timestamp renders through the horizontal centre.
 *
 * The y-axis is inverted relative to data space because SVG y grows downward,
 * so the highest value sits at the top of the box.
 */
export const buildSparklinePaths = (
    series: MultimetricStepSeries,
): SparklinePaths | null => {
    const points = series.data.filter(([, value]) => Number.isFinite(value));
    if (points.length < 2) return null;

    const timestamps = points.map(([ts]) => ts);
    const values = points.map(([, value]) => value);
    const minTs = timestamps[0];
    const maxTs = timestamps[timestamps.length - 1];
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const top = VERTICAL_PADDING;
    const bottom = SPARKLINE_HEIGHT - VERTICAL_PADDING;

    const xFor = (ts: number): number =>
        scale(ts, minTs, maxTs, 0, SPARKLINE_WIDTH);
    // outMin/outMax are swapped so larger values map to a smaller (higher) y.
    const yFor = (value: number): number =>
        scale(value, minValue, maxValue, bottom, top);

    const line = points
        .map(
            ([ts, value], index) =>
                `${index === 0 ? 'M' : 'L'} ${xFor(ts).toFixed(1)} ${yFor(value).toFixed(1)}`,
        )
        .join(' ');

    const firstX = xFor(minTs).toFixed(1);
    const lastX = xFor(maxTs).toFixed(1);
    const area = `${line} L ${lastX} ${SPARKLINE_HEIGHT} L ${firstX} ${SPARKLINE_HEIGHT} Z`;

    return { line, area };
};
