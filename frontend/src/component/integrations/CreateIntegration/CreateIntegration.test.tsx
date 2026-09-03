import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { render } from 'utils/testRenderer';
import { expect, test } from 'vitest';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { CreateIntegration } from './CreateIntegration.tsx';

const server = testServerSetup();

const renderAt = (route: string, path: string) => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { enterprise: '1.0.0' } },
    });
    testServerRoute(server, '/api/admin/projects', { projects: [] });
    testServerRoute(server, '/api/admin/environments', { environments: [] });
    testServerRoute(server, '/api/admin/addons', {
        addons: [],
        providers: [
            {
                name: 'slack-app',
                displayName: 'App for Slack',
                description: 'Posts messages to your Slack channels',
                documentationUrl: 'https://example.com',
                parameters: [],
                events: ['feature-created'],
            },
        ],
    });

    return render(
        <Routes>
            <Route path={path} element={<CreateIntegration />} />
        </Routes>,
        { route },
    );
};

test('offers the project selector outside a project', async () => {
    renderAt(
        '/integrations/create/slack-app',
        '/integrations/create/:providerId',
    );

    expect(
        await screen.findByTestId('select-project-input'),
    ).toBeInTheDocument();
});

test('drops the project selector inside a project', async () => {
    renderAt(
        '/projects/my-project/settings/integrations/create/slack-app',
        '/projects/:projectId/settings/integrations/create/:providerId',
    );

    expect(await screen.findByTestId('select-event-input')).toBeInTheDocument();
    expect(
        screen.queryByTestId('select-project-input'),
    ).not.toBeInTheDocument();
});
