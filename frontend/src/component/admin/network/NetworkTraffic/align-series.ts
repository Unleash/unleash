export type ResultValue = [number, string];

export type AlignedPoint = { x: number; y: number | null };

const secondsToMs = (seconds: number): number => seconds * 1000;

/**
 * The sorted union of every timestamp any series reports.
 *
 * Prometheus range queries share one step, but each series omits the steps
 * where it has no samples, so the arrays differ in length and offset.
 */
export const collectTimestamps = (allValues: ResultValue[][]): number[] =>
    [...new Set(allValues.flat().map(([seconds]) => seconds))].sort(
        (a, b) => a - b,
    );

/**
 * Place one series onto the shared timestamps, `null` where it has no sample.
 */
export const alignToTimestamps = (
    values: ResultValue[],
    timestamps: number[],
): AlignedPoint[] => {
    const samples = new Map(
        values.map(([seconds, value]) => [seconds, Number.parseFloat(value)]),
    );

    return timestamps.map((seconds) => ({
        x: secondsToMs(seconds),
        y: samples.get(seconds) ?? null,
    }));
};

/**
 * Whether a sample has a gap on both sides, and so draws no line segment.
 * Such a sample is invisible unless it gets a point marker of its own. Indexes
 * outside the array read as gaps, so a lone sample at either end counts.
 */
export const isIsolatedSample = (
    points: AlignedPoint[],
    index: number,
): boolean =>
    points[index]?.y != null &&
    points[index - 1]?.y == null &&
    points[index + 1]?.y == null;
