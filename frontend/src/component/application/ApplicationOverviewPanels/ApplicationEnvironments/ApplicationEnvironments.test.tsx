import { expect, test, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import type { ApiTokenSchema } from 'openapi';
import { ADMIN } from '@server/types/permissions';
import type { IApplicationEnvironment } from '../buildApplicationEnvironments.ts';
import { ApplicationEnvironments } from './ApplicationEnvironments.tsx';

const server = testServerSetup();

const token = (
    tokenName: string,
    extra: Partial<ApiTokenSchema> = {},
): ApiTokenSchema => ({
    tokenName,
    type: 'backend',
    projects: ['dx'],
    createdAt: '2026-11-17T10:00:00.000Z',
    ...extra,
});

const environment = (
    name: string,
    extra: Partial<IApplicationEnvironment> = {},
): IApplicationEnvironment => ({
    name,
    enabled: true,
    instanceCount: 0,
    lastSeen: null,
    tokens: [],
    linked: false,
    linkedProjects: [],
    observedProjects: [],
    ...extra,
});

const renderEnvironments = (
    environments: IApplicationEnvironment[],
    allTokensVisible = true,
) => {
    // the Create token button checks the token limit
    testServerRoute(server, '/api/admin/ui-config', {
        resourceLimits: { apiTokens: 10 },
    });
    testServerRoute(server, '/api/admin/api-tokens', { tokens: [] });
    const onCreateToken = vi.fn();
    render(
        <ApplicationEnvironments
            environments={environments}
            allTokensVisible={allTokensVisible}
            tokensPath='/applications/checkout/tokens'
            onCreateToken={onCreateToken}
        />,
        { permissions: [{ permission: ADMIN }] },
    );
    return onCreateToken;
};

const card = (name: string) => screen.getByRole('region', { name });

test('shows the instances, tokens and projects of a linked environment', () => {
    renderEnvironments([
        environment('production', {
            instanceCount: 8,
            lastSeen: new Date().toISOString(),
            tokens: [
                token('checkout-production'),
                token('checkout-old', {
                    expiresAt: '2020-01-01T00:00:00.000Z',
                }),
            ],
            linked: true,
            linkedProjects: ['dx', 'eg'],
        }),
        environment('staging', { linked: true, linkedProjects: ['*'] }),
    ]);

    const production = card('Production');
    within(production).getByText(/8 instances · last seen/);
    within(production).getByText('checkout-production');
    within(production).getByText('Expired');
    expect(within(production).getAllByText('Never used')).toHaveLength(2);
    expect(
        within(production).getByRole('link', { name: 'Manage tokens' }),
    ).toHaveAttribute('href', '/applications/checkout/tokens');
    expect(
        within(production)
            .getAllByRole('link')
            .map((link) => link.textContent),
    ).toEqual(['Manage tokens', 'dx', 'eg']);
    expect(within(production).queryByRole('button')).not.toBeInTheDocument();

    within(card('Staging')).getByText('All projects');
});

test('offers a token where none is linked, reporting or not', async () => {
    const onCreateToken = renderEnvironments([
        environment('development', {
            instanceCount: 3,
            observedProjects: ['mobile'],
        }),
        environment('staging'),
    ]);

    const development = card('Development');
    within(development).getByText('3 instances');
    within(development).getByText(
        "Reported by the SDK's appName, without a linked token",
    );
    within(development).getByText('No linked token');
    within(development).getByRole('link', { name: 'mobile observed' });

    const staging = card('Staging');
    within(staging).getByText('No instances reporting');
    within(staging).getByText('No projects');

    const create = within(staging).getByRole('button', {
        name: 'Create token in Staging',
    });
    await waitFor(() => expect(create).not.toHaveAttribute('aria-disabled'));
    await userEvent.click(create);
    expect(onCreateToken).toHaveBeenCalledWith('staging');
});

test('claims nothing about tokens when not all of them are visible', () => {
    renderEnvironments(
        [environment('production', { instanceCount: 8 })],
        false,
    );

    const production = card('Production');
    within(production).getByText('No token shown');
    expect(
        within(production).queryByText(/without a linked token/),
    ).not.toBeInTheDocument();
});

test('lists up to five tokens, working ones first, and links to the rest', () => {
    renderEnvironments([
        environment('development', {
            tokens: [
                token('old', { expiresAt: '2020-01-01T00:00:00.000Z' }),
                ...[1, 2, 3, 4, 5, 6].map((n) => token(`checkout-${n}`)),
            ],
            linked: true,
            linkedProjects: ['dx'],
        }),
    ]);

    const development = card('Development');
    expect(within(development).getAllByText(/^checkout-\d$/)).toHaveLength(5);
    expect(within(development).queryByText('old')).not.toBeInTheDocument();
    expect(
        within(development).getByRole('link', {
            name: '+2 more tokens in Development',
        }),
    ).toHaveAttribute('href', '/applications/checkout/tokens');
});

test('says why a card shows all projects', () => {
    const all = { projects: ['*'] };
    renderEnvironments([
        environment('development', {
            tokens: [token('a', all), token('b', all)],
            linked: true,
            linkedProjects: ['*'],
        }),
        environment('staging', {
            tokens: [
                token('named', { projects: ['eg', 'dx'] }),
                token('all', all),
                // expired: its projects no longer count
                token('old', {
                    projects: ['sa'],
                    expiresAt: '2020-01-01T00:00:00.000Z',
                }),
            ],
            linked: true,
            linkedProjects: ['*'],
        }),
        environment('production', {
            tokens: [
                token('one', { projects: ['dx'] }),
                token('two', { projects: ['eg'] }),
                token('a', all),
                token('b', all),
            ],
            linked: true,
            linkedProjects: ['*'],
        }),
    ]);

    within(card('Development')).getByText(
        'All projects available in Development',
    );
    within(card('Staging')).getByText(
        'One token reads dx and eg, another reads all projects, so the card shows “All projects”.',
    );
    within(card('Production')).getByText(
        '2 tokens read dx and eg, 2 others read all projects, so the card shows “All projects”.',
    );
});

test('lists five tokens without a link to more', () => {
    renderEnvironments([
        environment('development', {
            tokens: [1, 2, 3, 4, 5].map((n) => token(`checkout-${n}`)),
            linked: true,
            linkedProjects: ['dx'],
        }),
    ]);

    const development = card('Development');
    expect(within(development).getAllByText(/^checkout-\d$/)).toHaveLength(5);
    expect(
        within(development).queryByRole('link', { name: /more/ }),
    ).not.toBeInTheDocument();
});

test('does not count tokens in the all-projects note when some are hidden', () => {
    renderEnvironments(
        [
            environment('staging', {
                tokens: [
                    token('named', { projects: ['dx'] }),
                    token('all', { projects: ['*'] }),
                ],
                linked: true,
                linkedProjects: ['*'],
            }),
        ],
        false,
    );

    within(card('Staging')).getByText('All projects available in Staging');
});
