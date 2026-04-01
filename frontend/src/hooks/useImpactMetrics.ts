import { useEffect, useCallback } from 'react';
import { useUnleashClient } from '@unleash/proxy-client-react';

export const useImpactMetricsCounter = (name: string, help: string) => {
    const client = useUnleashClient();

    useEffect(() => {
        client?.impactMetrics?.defineCounter(name, help);
    }, [client, name, help]);

    const increment = useCallback(
        (value?: number) => {
            client?.impactMetrics?.incrementCounter(name, value);
        },
        [client, name],
    );

    return { increment };
};
