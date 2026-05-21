import type { MultimetricStepSeries } from 'component/impact-metrics/MultimetricChart/types';

export const BASELINE_VALUE = 100;

const firstNonZeroValue = (data: ReadonlyArray<[number, number]>): number => {
    for (const [, value] of data) {
        if (value !== 0 && Number.isFinite(value)) return value;
    }
    return 0;
};

// Rebases each series so its first non-zero, finite value maps to BASELINE_VALUE,
// and subsequent values scale proportionally. Designed so series with wildly
// different magnitudes (e.g. 197 vs. 7) can be read on a single axis.
//
// If a series has no non-zero baseline (all zeros, or empty), we fall back to
// BASELINE_VALUE + raw delta from zero — this avoids a divide-by-zero and keeps
// movement visible without inventing a baseline.
export const normalizeSeriesToBaseline = (
    stepSeries: MultimetricStepSeries[],
): MultimetricStepSeries[] =>
    stepSeries.map((series) => {
        const baseline = firstNonZeroValue(series.data);
        if (baseline === 0) {
            return {
                label: series.label,
                data: series.data.map(([timestamp, value]) => [
                    timestamp,
                    BASELINE_VALUE + value,
                ]),
            };
        }
        return {
            label: series.label,
            data: series.data.map(([timestamp, value]) => [
                timestamp,
                (value / baseline) * BASELINE_VALUE,
            ]),
        };
    });
