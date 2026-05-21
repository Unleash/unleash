import { useMemo } from 'react';
import { useEnvironmentEvents } from 'hooks/api/getters/useEnvironmentEvents/useEnvironmentEvents';
import type { ChartTimeRange } from 'component/impact-metrics/MultimetricChart/chartConfig';
import type { MetricView } from './types';

const AUTO_FOLLOW_CAP = 20;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const timeRangeToMs = (timeRange: ChartTimeRange): number => {
    switch (timeRange) {
        case 'hour':
            return HOUR_MS;
        case 'day':
            return DAY_MS;
        case 'week':
            return 7 * DAY_MS;
        case 'month':
            return 30 * DAY_MS;
    }
};

const toIsoDate = (ms: number): string =>
    new Date(ms).toISOString().slice(0, 10);

export type UseAutoFollowedFeatureNamesResult = {
    featureNames: string[];
    loading: boolean;
};

export const useAutoFollowedFeatureNames = (
    view: MetricView,
): UseAutoFollowedFeatureNamesResult => {
    const shouldAutoFollow =
        view.template === 'system-health' && view.autoFollowFlags === true;

    const now = Date.now();
    const from = toIsoDate(now - timeRangeToMs(view.timeRange));
    const to = toIsoDate(now);

    const { featureEvents, loading } = useEnvironmentEvents({
        environment: view.environment,
        from,
        to,
        enabled: shouldAutoFollow,
    });

    return useMemo(() => {
        if (!shouldAutoFollow) {
            return { featureNames: view.featureNames, loading: false };
        }

        const seen = new Set<string>();
        const orderedAuto: string[] = [];
        // featureEvents come back newest-first from the search endpoint;
        // dedupe preserves the most-recent-change ordering.
        for (const event of featureEvents) {
            const name = event.featureName;
            if (!name || seen.has(name)) continue;
            seen.add(name);
            orderedAuto.push(name);
            if (orderedAuto.length >= AUTO_FOLLOW_CAP) break;
        }

        const merged = [...orderedAuto];
        for (const manual of view.featureNames) {
            if (!seen.has(manual)) {
                seen.add(manual);
                merged.push(manual);
            }
        }

        return { featureNames: merged, loading };
    }, [shouldAutoFollow, featureEvents, view.featureNames, loading]);
};
