import { expect, test } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import type { ApiTokenSchema } from 'openapi';
import { ADMIN, READ_CLIENT_API_TOKEN } from '@server/types/permissions';
import { ApplicationOverviewPanels } from './ApplicationOverviewPanels.tsx';

const server = testServerSetup();

const token = (
    tokenName: string,
    environment: string,
    projects: string[],
    extra: Partial<ApiTokenSchema> = {},
): ApiTokenSchema => ({
    tokenName,
    environment,
    type: 'backend',
    secret: `*:${environment}.${tokenName}`,
    projects,
    createdAt: '2026-11-17T10:00:00.000Z',
    seenAt: null,
    ...extra,
});

const activity = (name: string, instanceCount: number) => ({
    name,
    instanceCount,
    lastSeen: new Date().toISOString(),
    sdks: [],
    frontendSdks: [],
    backendSdks: [],
    issues: { missingFeatures: [], outdatedSdks: [] },
});

const setup = (tokens: ApiTokenSchema[], status = 200) => {
    testServerRoute(server, '/api/admin/ui-config', {
        resourceLimits: { apiTokens: 10 },
    });
    testServerRoute(server, '/api/admin/projects', { projects: [] });
    testServerRoute(server, '/api/admin/environments', {
        environments: [
            { name: 'production', enabled: true, sortOrder: 1 },
            { name: 'staging', enabled: true, sortOrder: 2 },
            { name: 'development', enabled: true, sortOrder: 3 },
            { name: 'retired', enabled: false, sortOrder: 4 },
        ],
    });
    testServerRoute(server, '/api/admin/api-tokens', { tokens: [] });
    testServerRoute(
        server,
        '/api/admin/api-tokens',
        { tokens },
        'get',
        status,
        {
            appName: 'IS:checkout',
        },
    );
};

const renderPanels = (
    overview: {
        environments: ReturnType<typeof activity>[];
        projects: string[];
    },
    permissions = [{ permission: ADMIN }],
) =>
    render(
        <Routes>
            <Route
                path='/applications/:name'
                element={<ApplicationOverviewPanels overview={overview} />}
            />
        </Routes>,
        { route: '/applications/checkout', permissions },
    );

const region = (name: string) => screen.findByRole('region', { name });

test('shows a card per environment and creates a token from one', async () => {
    setup([token('checkout-production', 'production', ['dx'])]);
    renderPanels({ environments: [activity('development', 3)], projects: [] });

    within(await region('Production')).getByText('checkout-production');
    within(await region('Projects')).getByRole('link', { name: 'dx' });
    within(await region('Development')).getByText('3 instances', {
        exact: false,
    });

    const create = await screen.findByRole('button', {
        name: 'Create token in Development',
    });
    await waitFor(() => expect(create).not.toHaveAttribute('aria-disabled'));
    await userEvent.click(create);

    // the panel opens with the environment filled in
    await screen.findByDisplayValue('checkout-development');
});

test('says the linked tokens are hidden without permission to read them', async () => {
    setup([token('checkout-production', 'production', ['dx'])]);
    renderPanels(
        { environments: [activity('production', 8)], projects: [] },
        [],
    );

    await screen.findByText(
        "Linked tokens are not shown: you don't have permission to read API tokens.",
    );
    within(await region('Production')).getByText('No token shown');
});

test('names the token type the viewer cannot read', async () => {
    setup([token('checkout-production', 'production', ['dx'])]);
    renderPanels({ environments: [], projects: [] }, [
        { permission: READ_CLIENT_API_TOKEN },
    ]);

    await screen.findByText(
        "Frontend tokens are not shown: you don't have permission to read them.",
    );
    within(await region('Production')).getByText('checkout-production');
});

test('when the linked tokens fail to load, still shows what the SDKs report', async () => {
    setup([], 500);
    renderPanels({ environments: [activity('production', 8)], projects: [] });

    await screen.findByText(/Could not load the API tokens/);
    within(await region('Production')).getByText(/8 instances/);
});
