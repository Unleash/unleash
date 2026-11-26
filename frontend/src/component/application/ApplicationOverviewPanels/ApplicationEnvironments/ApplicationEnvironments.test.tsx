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
