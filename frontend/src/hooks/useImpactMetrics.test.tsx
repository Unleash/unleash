import { renderHook } from '@testing-library/react';
import { UnleashClient, InMemoryStorageProvider } from 'unleash-proxy-client';
import FlagProvider from '@unleash/proxy-client-react';
import { useImpactMetricsCounter } from './useImpactMetrics';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

test('defines counter and increments via real SDK', async () => {
    const { requests }: { requests: any[] } = testServerRoute(
        server,
        'http://localhost:12345//client/metrics',
        {},
        'post',
    );

    const client = new UnleashClient({
        url: 'http://localhost:12345',
        clientKey: 'test',
        appName: 'test',
        storageProvider: new InMemoryStorageProvider(),
        disableRefresh: true,
        metricsInterval: 0,
        metricsIntervalInitial: 0,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <FlagProvider unleashClient={client} startClient={false}>
            {children}
        </FlagProvider>
    );

    const { result } = renderHook(
        () => useImpactMetricsCounter('my_counter', 'A counter'),
        { wrapper },
    );

    result.current.increment();
    result.current.increment();

    await client.sendMetrics();

    expect(requests[0].impactMetrics).toHaveLength(1);
    expect(requests[0].impactMetrics[0].name).toBe('my_counter');
});
