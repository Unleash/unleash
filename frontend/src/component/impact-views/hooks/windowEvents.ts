import { addDays, format, subDays } from 'date-fns';
import type {
    MultimetricFeatureEvent,
    TimeWindow,
} from 'component/impact-metrics/MultimetricChart/types';

// The events search API filters by date only (yyyy-MM-dd), not by time. We
// derive the date range that *covers* the chart's visible window and pad it by
// one day on each side. The padding makes the fetch a strict superset of the
// window — which neutralises both the day-granularity of the API and any
// local-vs-UTC day-boundary skew — so the client-side window filter is exact.
//
// `start`/`end` are Unix-second strings (as produced by the impact-metrics
// API). Dates are formatted in LOCAL time to match the chart's local x-axis.
// Returns `null` until both bounds are valid — the impact-metrics getter serves
// empty `start`/`end` before the first response loads.
export const deriveDateRange = (
    start: string,
    end: string,
): { fromDate: string; toDate: string } | null => {
    const startMs = Number.parseInt(start, 10) * 1000;
    const endMs = Number.parseInt(end, 10) * 1000;
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return null;
    return {
        fromDate: format(subDays(new Date(startMs), 1), 'yyyy-MM-dd'),
        toDate: format(addDays(new Date(endMs), 1), 'yyyy-MM-dd'),
    };
};

export const isInWindow = (
    event: MultimetricFeatureEvent,
    window: TimeWindow,
): boolean =>
    event.timestamp >= window.fromMs && event.timestamp <= window.toMs;

// The events that fall inside the selected window, sorted chronologically.
export const filterEventsToWindow = (
    events: MultimetricFeatureEvent[],
    window: TimeWindow,
): MultimetricFeatureEvent[] =>
    events
        .filter((event) => isInWindow(event, window))
        .sort((left, right) => left.timestamp - right.timestamp);
