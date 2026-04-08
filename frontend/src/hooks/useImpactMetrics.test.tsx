import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UnleashClient, InMemoryStorageProvider } from 'unleash-proxy-client';
import FlagProvider from '@unleash/proxy-client-react';
import { useImpactMetricsCounter } from './useImpactMetrics';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

const TestCounterComponent = () => {
    const { increment } = useImpactMetricsCounter('my_counter', 'A counter');
    return (
        <button type='button' onClick={() => increment()}>
            Increment
        </button>
    );
};

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

    render(
        <FlagProvider unleashClient={client} startClient={false}>
            <TestCounterComponent />
        </FlagProvider>,
    );

    const button = await screen.findByText('Increment');
    await userEvent.click(button);
    await userEvent.click(button);

    await client.sendMetrics();

    expect(requests[0]).toMatchObject({
        impactMetrics: [
            {
                name: 'my_counter',
                type: 'counter',
                samples: [{ value: 2 }],
            },
        ],
    });
});
