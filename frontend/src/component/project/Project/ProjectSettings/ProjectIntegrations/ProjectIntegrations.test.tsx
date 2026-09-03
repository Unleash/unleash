import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { render } from 'utils/testRenderer';
import { expect, test } from 'vitest';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { CREATE_ADDON } from 'component/providers/AccessProvider/permissions';
import { ProjectIntegrations } from './ProjectIntegrations.tsx';

const server = testServerSetup();

const providers = [
    {
        name: 'slack-app',
        displayName: 'App for Slack',
        description: 'Posts messages to your Slack channels',
        documentationUrl: 'https://example.com',
        parameters: [],
        events: ['feature-created', 'feature-updated'],
    },
    {
        name: 'webhook',
        displayName: 'Webhook',
        description: 'Posts to an HTTP endpoint',
        documentationUrl: 'https://example.com',
        parameters: [],
        events: [],
    },
];

const addon = (
    id: number,
    description: string,
    projects: string[],
    provider = 'slack-app',
) => ({
    id,
    provider,
    enabled: true,
    description,
    parameters: {},
    events: [],
    projects,
    environments: [],
});

const setupServer = (addons: object[]) => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { enterprise: '1.0.0' } },
    });
    testServerRoute(server, '/api/admin/signal-endpoints', {
        signalEndpoints: [],
    });
    testServerRoute(server, '/api/admin/addons', { providers, addons });
};

const renderPage = () =>
    render(
        <Routes>
            <Route
                path='/projects/:projectId/settings/integrations/*'
                element={<ProjectIntegrations />}
            />
        </Routes>,
        { route: '/projects/my-project/settings/integrations' },
    );

test('shows only the Slack integrations scoped to this project alone', async () => {
    setupServer([
        addon(1, 'Ours', ['my-project']),
        addon(2, 'Another project', ['someone-else']),
        addon(3, 'Instance wide', []),
        addon(4, 'Every project', ['*']),
        addon(5, 'Shared with another project', ['my-project', 'someone-else']),
        addon(6, 'Ours but a webhook', ['my-project'], 'webhook'),
    ]);

    renderPage();

    expect(await screen.findByText('Ours')).toBeInTheDocument();
    expect(screen.queryByText('Another project')).not.toBeInTheDocument();
    expect(screen.queryByText('Instance wide')).not.toBeInTheDocument();
    expect(screen.queryByText('Every project')).not.toBeInTheDocument();
    expect(
        screen.queryByText('Shared with another project'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Ours but a webhook')).not.toBeInTheDocument();
});

test('links to the integration inside the project', async () => {
    setupServer([addon(1, 'Ours', ['my-project'])]);

    renderPage();

    const link = await screen.findByRole('link', { name: /Ours/ });
    expect(link).toHaveAttribute(
        'href',
        '/projects/my-project/settings/integrations/edit/1',
    );
});

test('points you at the integrations page when the project has none', async () => {
    setupServer([addon(1, 'Instance wide', [])]);

    renderPage();

    expect(
        await screen.findByText(/no Slack integrations yet/),
    ).toBeInTheDocument();
    expect(screen.queryByText('Instance wide')).not.toBeInTheDocument();
});

test('reports a failure instead of claiming the project has none', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { enterprise: '1.0.0' } },
    });
    testServerRoute(server, '/api/admin/signal-endpoints', {
        signalEndpoints: [],
    });
    testServerRoute(server, '/api/admin/addons', {}, 'get', 500);

    renderPage();

    expect(await screen.findByText(/Could not load/)).toBeInTheDocument();
    expect(
        screen.queryByText(/no Slack integrations yet/),
    ).not.toBeInTheDocument();
});

test('creates an integration already scoped to this project', async () => {
    const user = userEvent.setup();
    setupServer([]);
    testServerRoute(server, '/api/admin/projects', { projects: [] });
    testServerRoute(server, '/api/admin/environments', { environments: [] });
    const { requests } = testServerRoute(
        server,
        '/api/admin/addons',
        { id: 1 },
        'post',
        201,
    );

    render(
        <Routes>
            <Route
                path='/projects/:projectId/settings/integrations/*'
                element={<ProjectIntegrations />}
            />
        </Routes>,
        {
            route: '/projects/my-project/settings/integrations/create/slack-app',
            permissions: [{ permission: CREATE_ADDON }],
        },
    );

    const events = await screen.findByTestId('select-event-input');
    // The project is implied by where you are, so the selector is not offered.
    expect(
        screen.queryByTestId('select-project-input'),
    ).not.toBeInTheDocument();

    await user.click(within(events).getByRole('combobox'));
    await user.click(await screen.findByText('feature-created'));
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0]).toMatchObject({
        provider: 'slack-app',
        projects: ['my-project'],
        events: ['feature-created'],
    });
});
