import { useEffect, useCallback } from 'react';
import { useUnleashClient } from '@unleash/proxy-client-react';

export const useImpactMetricsHistogram = (
    name: string,
    help: string,
    buckets: number[],
) => {
    const client = useUnleashClient();

    useEffect(() => {
        client?.impactMetrics?.defineHistogram(name, help, buckets);
    }, [client, name, help, buckets]);

    const observe = useCallback(
        (value: number) => {
            client?.impactMetrics?.observeHistogram(name, value);
        },
        [client, name],
    );

    return { observe };
};
