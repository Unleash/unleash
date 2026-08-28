import { useImpactMetricsMetadata } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { useEffect, useState } from 'react';

const POLL_INTERVAL = 5_000; // 5 seconds
const POLL_TIMEOUT = 60_000; // 1 minute

export const useCheckMetricAvailable = (metricName: string) => {
    const [timedOut, setTimedOut] = useState(false);

    const { metadata } = useImpactMetricsMetadata({
        refreshInterval: timedOut ? 0 : POLL_INTERVAL,
    });

    const isAvailable =
        metadata?.metrics.some((m) => m.name === metricName) || false;

    useEffect(() => {
        if (isAvailable) return;

        const timeout = setTimeout(() => setTimedOut(true), POLL_TIMEOUT);
        return () => clearTimeout(timeout);
    }, [isAvailable]);

    return { isAvailable, timedOut };
};
