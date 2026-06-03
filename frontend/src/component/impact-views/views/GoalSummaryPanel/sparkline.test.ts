import { describe, expect, it } from 'vitest';
import type { MultimetricStepSeries } from 'component/impact-metrics/MultimetricChart/types';
import {
    buildSparklinePaths,
    SPARKLINE_HEIGHT,
    SPARKLINE_WIDTH,
} from './sparkline';

const series = (data: [number, number][]): MultimetricStepSeries => ({
    label: 'goal',
    data,
});

describe('buildSparklinePaths', () => {
    it('returns null when there are no points', () => {
        expect(buildSparklinePaths(series([]))).toBeNull();
    });

    it('returns null when there is only one finite point', () => {
        expect(buildSparklinePaths(series([[0, 10]]))).toBeNull();
    });

    it('drops non-finite values, then returns null if fewer than two remain', () => {
        expect(
            buildSparklinePaths(
                series([
                    [0, Number.NaN],
                    [1, 10],
                    [2, Number.POSITIVE_INFINITY],
                ]),
            ),
        ).toBeNull();
    });

    it('scales the first and last points to the horizontal edges', () => {
        const paths = buildSparklinePaths(
            series([
                [100, 0],
                [200, 100],
            ]),
        );
        expect(paths).not.toBeNull();
        // First point starts the line at x=0, last point reaches the full width.
        expect(paths?.line.startsWith('M 0.0 ')).toBe(true);
        expect(paths?.line).toContain(`L ${SPARKLINE_WIDTH.toFixed(1)} `);
    });

    it('puts the max value at the top and the min at the bottom (inverted y)', () => {
        // Two points: min (10) then max (20). `d` is "M x0 y0 L x1 y1"; the
        // numbers alternate x, y, x, y.
        const paths = buildSparklinePaths(
            series([
                [0, 10],
                [1, 20],
            ]),
        );
        const numbers = (paths?.line.match(/[\d.]+/g) ?? []).map(Number);
        const firstY = numbers[1];
        const secondY = numbers[3];
        // Min value → near the bottom (larger y); max → near the top (smaller y).
        expect(firstY).toBeGreaterThan(secondY);
        // Concretely: min sits at the bottom edge, max at the top edge.
        expect(firstY).toBe(SPARKLINE_HEIGHT - 2);
        expect(secondY).toBe(2);
    });

    it('draws a flat series through the vertical centre', () => {
        const paths = buildSparklinePaths(
            series([
                [0, 5],
                [1, 5],
                [2, 5],
            ]),
        );
        const centre = (SPARKLINE_HEIGHT / 2).toFixed(1);
        // Every point sits at the vertical midpoint.
        expect(paths?.line).toBe(
            `M 0.0 ${centre} L ${(SPARKLINE_WIDTH / 2).toFixed(1)} ${centre} L ${SPARKLINE_WIDTH.toFixed(1)} ${centre}`,
        );
    });

    it('closes the area path back along the baseline', () => {
        const paths = buildSparklinePaths(
            series([
                [0, 0],
                [10, 100],
            ]),
        );
        // Area = the line, then down to the baseline under the last x, across
        // to the first x, and closed.
        expect(paths?.area).toBe(
            `${paths?.line} L ${SPARKLINE_WIDTH.toFixed(1)} ${SPARKLINE_HEIGHT} L 0.0 ${SPARKLINE_HEIGHT} Z`,
        );
    });
});
