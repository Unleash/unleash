import { expect, test } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import type { ApiTokenSchema } from 'openapi';
import {
    ADMIN,
    DELETE_FRONTEND_API_TOKEN,
    READ_CLIENT_API_TOKEN,
    READ_FRONTEND_API_TOKEN,
} from '@server/types/permissions';
import { ApplicationApiTokens } from './ApplicationApiTokens.tsx';
import { ApplicationApiTokensTabLabel } from '../ApplicationApiTokensTabLabel/ApplicationApiTokensTabLabel.tsx';

const server = testServerSetup();

const token = (
    tokenName: string,
    environment: string,
    extra: Partial<ApiTokenSchema> = {},
): ApiTokenSchema => ({
    tokenName,
    environment,
    type: 'backend',
    secret: `*:${environment}.${tokenName}`,
    projects: ['*'],
    createdAt: '2026-11-17T10:00:00.000Z',
    seenAt: null,
    ...extra,
});

// What the list of tokens linked to the application answers from now on.
const linkedTokens = (tokens: ApiTokenSchema[], status = 200) =>
    testServerRoute(
        server,
        '/api/admin/api-tokens',
        { tokens },
        'get',
        status,
        { appName: 'IS:checkout' },
    );

const setup = (tokens: ApiTokenSchema[] = [], instances: object[] = []) => {
    testServerRoute(server, '/api/admin/ui-config', {
        resourceLimits: { apiTokens: 10 },
    });
    testServerRoute(server, '/api/admin/projects', { projects: [] });
    testServerRoute(server, '/api/admin/environments', {
        environments: [
            { name: 'production', enabled: true },
            { name: 'staging', enabled: true },
            { name: 'development', enabled: true },
            { name: 'old', enabled: false },
        ],
    });
    testServerRoute(
        server,
        '/api/admin/metrics/applications/checkout/overview',
        { environments: instances },
    );
    testServerRoute(server, '/api/admin/api-tokens', { tokens: [] });
    linkedTokens(tokens);
    return testServerRoute(
        server,
        '/api/admin/api-tokens',
        { secret: 'new-secret' },
        'post',
        201,
    );
};

const renderTab = (permissions = [{ permission: ADMIN }]) =>
    render(
        <Routes>
            <Route
                path='/applications/:name/tokens'
                element={
                    <>
                        <div data-testid='tab-label'>
                            <ApplicationApiTokensTabLabel />
                        </div>
                        <ApplicationApiTokens />
                    </>
                }
            />
        </Routes>,
        { route: '/applications/checkout/tokens', permissions },
    );

const tabLabel = () => screen.getByTestId('tab-label');

const card = (name: string) => screen.findByRole('region', { name });

const openCreatePanel = async (name: string) => {
    const open = await screen.findByRole('button', { name });
    await waitFor(() => expect(open).not.toHaveAttribute('aria-disabled'));
    await userEvent.click(open);
};

test('shows a card per enabled environment, with the right message', async () => {
    setup(
        [],
        [
            { name: 'production', instanceCount: 4 },
            { name: 'staging', instanceCount: 1 },
        ],
    );
    renderTab();

    await screen.findByText(/Tokens created here belong to checkout/);
    expect(
        screen
            .getAllByRole('heading', { level: 3 })
            .map((heading) => heading.textContent),
    ).toEqual(['Production', 'Staging', 'Development']);

    const production = await card('Production');
    within(production).getByText(
        '4 instances report here without a linked token.',
    );
    within(production).getByRole('button', {
        name: 'Create token in Production',
    });
    within(await card('Staging')).getByText(
        '1 instance reports here without a linked token.',
    );
    within(await card('Development')).getByText(
        'No token for Development yet.',
    );
});

test('lists the linked tokens in their environment card', async () => {
    setup([
        token('checkout-web', 'production', { type: 'frontend' }),
        token('checkout-old', 'production', {
            expiresAt: '2020-01-01T00:00:00.000Z',
        }),
        token('checkout-legacy', 'old'),
    ]);
    renderTab();

    within(await card('Old')).getByText('checkout-legacy');

    const production = await card('Production');
    screen.getByRole('heading', { name: 'Tokens (3)' });
    within(production).getByText('2 tokens');
    const [header, web, old] = within(production).getAllByRole('row');
    expect(
        within(header)
            .getAllByRole('columnheader')
            .map((cell) => cell.textContent),
    ).toEqual(['Name', 'Type', 'Projects', 'Last used', 'Status', 'Actions']);
    within(web).getByText('checkout-web');
    within(web).getByText('Frontend');
    within(web).getByText('All');
    within(web).getByText('Never');
    within(web).getByText('Active');
    within(old).getByText('Backend');
    within(old).getByText('Expired');
    expect(screen.queryByText(/tokens are not listed/)).toBeNull();
});

test('refreshes the list and the tab count while the new secret is shown', async () => {
    const { requests } = setup();
    renderTab();

    await openCreatePanel('Create token in Staging');
    await screen.findByRole('radio', { name: 'staging', checked: true });
    linkedTokens([token('checkout-staging', 'staging')]);
    await userEvent.click(
        screen.getByRole('checkbox', {
            name: /All current and future projects/,
        }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Create token' }));

    await screen.findByText('1 token');
    expect(tabLabel()).toHaveTextContent('Tokens1');
    screen.getByText('new-secret');
    expect(requests).toMatchObject([
        { appName: 'checkout', environment: 'staging' },
    ]);
});

test('keeps the new secret on screen when the list fails to refresh', async () => {
    setup();
    renderTab();

    await openCreatePanel('Create token');
    await screen.findByRole('radio', { name: 'production', checked: true });
    linkedTokens([], 500);
    await userEvent.click(
        screen.getByRole('checkbox', {
            name: /All current and future projects/,
        }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Create token' }));

    await screen.findByText('new-secret');
    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    within(await card('Production')).getByText('No token for Production yet.');
    expect(screen.queryByText(/Could not load the API tokens/)).toBeNull();
});

test('tells a user without token read permission why there are no tokens', async () => {
    setup();
    renderTab([]);

    await screen.findByText(/You need permission to read API tokens/);
    expect(tabLabel()).toHaveTextContent(/^Tokens$/);
});

test.each([
    200, 404,
])('empties the card after a delete that answers %s', async (status) => {
    setup([token('checkout-api', 'production')]);
    const deleted: string[] = [];
    server.use(
        http.delete('/api/admin/api-tokens/:token', ({ params }) => {
            deleted.push(String(params.token));
            return HttpResponse.json({}, { status });
        }),
    );
    renderTab();

    await userEvent.click(
        await screen.findByRole('button', { name: 'Delete token' }),
    );
    linkedTokens([]);
    await userEvent.click(screen.getByRole('button', { name: /Yes/ }));

    await within(await card('Production')).findByText(
        'No token for Production yet.',
    );
    expect(deleted).toEqual(['*:production.checkout-api']);
});

test('only offers to delete the token types the user may delete', async () => {
    setup([
        token('checkout-web', 'production', { type: 'frontend' }),
        token('checkout-api', 'production'),
    ]);
    renderTab([
        { permission: READ_CLIENT_API_TOKEN },
        { permission: READ_FRONTEND_API_TOKEN },
        { permission: DELETE_FRONTEND_API_TOKEN },
    ]);

    const [, web, api] = within(await card('Production')).getAllByRole('row');
    expect(within(web).getByRole('button')).toBeEnabled();
    expect(within(api).getByRole('button')).toBeDisabled();
});

test('says when the tokens could not be loaded', async () => {
    setup();
    linkedTokens([], 500);
    renderTab();

    await screen.findByText(/Could not load the API tokens/);
    expect(tabLabel()).toHaveTextContent(/^Tokens$/);
});

test('names the token types the user may not read, and claims nothing about them', async () => {
    setup([token('checkout-web', 'production', { type: 'frontend' })]);
    renderTab([{ permission: READ_FRONTEND_API_TOKEN }]);

    await screen.findByText(
        "Backend tokens are not listed: you don't have permission to read them.",
    );
    screen.getByRole('heading', { name: 'Tokens' });
    within(await card('Development')).getByText(
        'No token you can see for Development.',
    );
});
