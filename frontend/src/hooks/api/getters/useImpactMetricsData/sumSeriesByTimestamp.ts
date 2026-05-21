import type { ImpactMetricsResponse } from './useImpactMetricsData';

// Collapses every series in a `/api/admin/impact-metrics` response into a
// single sorted `[timestamp, number][]` by summing values at each timestamp.
//
// The response can return multiple series — one per label combination — when
// the queried metric has labels and the request doesn't filter to a single
// combination. The multimetric chart card renders one line per *metric*
// (not per label), so we merge the label-keyed series into one canonical
// time series that matches `sum(<metric>)` semantics in PromQL.
export const sumSeriesByTimestamp = (
    series: ImpactMetricsResponse['series'],
): [number, number][] => {
    const sums = new Map<number, number>();
    for (const entry of series) {
        for (const [timestamp, raw] of entry.data) {
            const value = Number(raw);
            if (!Number.isFinite(value)) continue;
            sums.set(timestamp, (sums.get(timestamp) ?? 0) + value);
        }
    }
    return Array.from(sums.entries()).sort((left, right) => left[0] - right[0]);
};
