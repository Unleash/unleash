import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { UnleashClient, InMemoryStorageProvider } from 'unleash-proxy-client';
import FlagProvider from '@unleash/proxy-client-react';
import { useImpactViewsTracking } from './useImpactViewsTracking';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

const TestComponent = () => {
    const { trackViewCreated, trackViewUpdated, trackViewDeleted } =
        useImpactViewsTracking();
    return (
        <>
            <button type='button' onClick={() => trackViewCreated()}>
                Create
            </button>
            <button type='button' onClick={() => trackViewUpdated()}>
                Update
            </button>
            <button type='button' onClick={() => trackViewDeleted()}>
                Delete
            </button>
        </>
    );
};

const setup = (ui: ReactNode) => {
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
            {ui}
        </FlagProvider>,
    );

    return { client, requests };
};

test('increments the matching counter for each tracked action', async () => {
    const { client, requests } = setup(<TestComponent />);

    await userEvent.click(await screen.findByText('Create'));
    await userEvent.click(await screen.findByText('Create'));
    await userEvent.click(await screen.findByText('Update'));
    await userEvent.click(await screen.findByText('Delete'));

    await client.sendMetrics();

    expect(requests[0].impactMetrics).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                name: 'impact_views_view_created',
                type: 'counter',
                samples: [expect.objectContaining({ value: 2 })],
            }),
            expect.objectContaining({
                name: 'impact_views_view_updated',
                type: 'counter',
                samples: [expect.objectContaining({ value: 1 })],
            }),
            expect.objectContaining({
                name: 'impact_views_view_deleted',
                type: 'counter',
                samples: [expect.objectContaining({ value: 1 })],
            }),
        ]),
    );
});
