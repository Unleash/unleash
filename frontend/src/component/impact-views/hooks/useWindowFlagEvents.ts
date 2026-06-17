import { useMemo } from 'react';
import { useEventSearch } from 'hooks/api/getters/useEventSearch/useEventSearch';
import type { MultimetricFeatureEvent } from 'component/impact-metrics/MultimetricChart/types';
import { FEATURE_TYPES, mapFeatureEvents } from './mapFeatureEvents';

export type UseWindowFlagEvents = {
    events: MultimetricFeatureEvent[];
    loading: boolean;
    // True when the API hit its result cap, so the list may be incomplete.
    truncated: boolean;
};

const LIMIT = 1000;

// Fetches ALL flag flips (enabled/disabled) in the given environment within the
// date range — deliberately NOT filtered to followed flags, so the brush
// selection can surface flags the user doesn't follow. Date-range filtering is
// coarse (day granularity); callers narrow to the exact window client-side via
// `filterEventsToWindow`.
//
// `range` is null until the chart's window has loaded; while null the query is
// disabled and no events are returned.
export const useWindowFlagEvents = (
    environment: string,
    range: { fromDate: string; toDate: string } | null,
): UseWindowFlagEvents => {
    const { events, total, loading } = useEventSearch(
        range
            ? {
                  type: FEATURE_TYPES,
                  environment: `IS:${environment}`,
                  from: `IS:${range.fromDate}`,
                  to: `IS:${range.toDate}`,
                  limit: `${LIMIT}`,
              }
            : {},
        { refreshInterval: 30_000, isPaused: () => range === null },
        'window-flag-events:',
    );

    const mapped = useMemo<MultimetricFeatureEvent[]>(
        () => mapFeatureEvents(events, environment),
        [events, environment],
    );

    return { events: mapped, loading, truncated: total > events.length };
};
