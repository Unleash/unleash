import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { IntegrationConnected } from './IntegrationConnected.tsx';

const server = testServerSetup();

const CALLBACK = '/api/admin/integrations/test-provider/callback';
const LANDING =
    '/integrations/connected/test-provider#state=the-connection&sealed_connection=the.sealed.token';

const renderLanding = () =>
    render(
        <Routes>
            <Route
                path='/integrations/connected/:providerId'
                element={<IntegrationConnected />}
            />
        </Routes>,
        { route: LANDING },
    );

test('should open the integration Unleash created from the returned token', async () => {
    const { requests } = testServerRoute(
        server,
        CALLBACK,
        { path: '/integrations/edit/7' },
        'post',
    );
    const historyBeforeLanding = window.history.length;

    renderLanding();

    await waitFor(() =>
        expect(window.location.pathname).toBe('/integrations/edit/7'),
    );
    expect(requests).toEqual([
        { state: 'the-connection', sealed_connection: 'the.sealed.token' },
    ]);
    expect(window.history.length).toBe(historyBeforeLanding + 1);
});

test('should show why connecting failed, leaving no token in the URL', async () => {
    const message =
        "You don't have the required permissions to perform this operation.";
    testServerRoute(
        server,
        CALLBACK,
        { name: 'PermissionError', message },
        'post',
        403,
    );

    renderLanding();

    expect(await screen.findByText(new RegExp(message))).toBeInTheDocument();
    expect(window.location.hash).toBe('');
});
