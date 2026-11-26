import { expect, test } from 'vitest';
import { screen, within } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import type { ApiTokenSchema } from 'openapi';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ApplicationProjects } from './ApplicationProjects.tsx';

const server = testServerSetup();

const environment = (
    name: string,
    linkedProjects: string[],
    observedProjects: string[] = [],
    tokens: ApiTokenSchema[] = [],
) => ({
    name,
    enabled: true,
    instanceCount: 0,
    lastSeen: null,
    tokens,
    linked: linkedProjects.length > 0,
    linkedProjects,
    observedProjects,
});

const allProjectsToken = (
    tokenName: string,
    extra: Partial<ApiTokenSchema> = {},
): ApiTokenSchema => ({
    tokenName,
    type: 'backend',
    projects: ['*'],
    createdAt: '2026-11-17T10:00:00.000Z',
    ...extra,
});

const renderProjects = (
    environments: ReturnType<typeof environment>[],
    observedProjects: string[],
    allTokensVisible = true,
) => {
    testServerRoute(server, '/api/admin/ui-config', {});
    render(
        <ApplicationProjects
            environments={environments}
            observedProjects={observedProjects}
            allTokensVisible={allTokensVisible}
        />,
    );
    return screen.getByRole('region', { name: 'Projects' });
};

const headers = (panel: HTMLElement) =>
    within(panel)
        .getAllByRole('columnheader')
        .map((header) => header.textContent);

// the cells after the project name
const cells = (panel: HTMLElement, project: string) =>
    within(within(panel).getByText(project).closest('tr')!)
        .getAllByRole('cell')
        .slice(1);

test('shows where each project is linked, covered or observed', () => {
    const panel = renderProjects(
        [
            environment('production', ['dx', 'eg']),
            environment(
                'staging',
                ['*'],
                [],
                [
                    allProjectsToken('checkout'),
                    allProjectsToken('checkout'),
                    allProjectsToken('checkout-ci'),
                    allProjectsToken('checkout-old', {
                        expiresAt: '2020-01-01T00:00:00.000Z',
                    }),
                ],
            ),
        ],
        ['dx', 'sa', 'dx'],
    );

    within(panel).getByText('3 projects · 2 with observed usage');
    expect(headers(panel)).toEqual([
        'Project',
        'Production',
        'Staging',
        'Observed usage',
    ]);
    expect(
        within(within(panel).getByRole('list', { name: 'Legend' }))
            .getAllByRole('listitem')
            .map((item) => item.textContent),
    ).toEqual(['In a linked token', 'Covered by "All projects"']);

    expect(within(panel).getAllByRole('row')[1]).toHaveTextContent(
        'All projects',
    );
    const [allProduction, allStaging, allUsage] = cells(panel, 'All projects');
    within(allProduction).getByText('Not in a linked token');
    within(allStaging).getByTitle('In a linked token');
    expect(allUsage).toHaveTextContent('From checkout, checkout-ci');

    const [dxProduction, dxStaging, dxUsage] = cells(panel, 'dx');
    within(dxProduction).getByTitle('In a linked token');
    within(dxStaging).getByTitle('Covered by "All projects"');
    expect(dxUsage).toHaveTextContent('Flags evaluated recently');

    const [, , egUsage] = cells(panel, 'eg');
    expect(egUsage).toHaveTextContent(
        "No recent usage · not a signal it's safe to remove",
    );

    // observed, but either environment could have reported it
    const [saProduction] = cells(panel, 'sa');
    within(saProduction).getByText('Not in a linked token');
    within(panel).getByText(
        'Staging tokens can read all projects, so only projects in use are listed.',
    );
});

test('marks the environment a project was observed in when that is known', () => {
    const panel = renderProjects(
        [environment('production', [], ['search']), environment('staging', [])],
        ['search'],
    );

    const [production, staging] = cells(panel, 'search');
    within(production).getByTitle('Observed only');
    // only the marks the table shows
    expect(
        within(within(panel).getByRole('list', { name: 'Legend' }))
            .getAllByRole('listitem')
            .map((item) => item.textContent),
    ).toEqual(['Observed only']);
    within(staging).getByText('Not in a linked token');
});

test('lists only the observed projects when not every token is visible', () => {
    const panel = renderProjects(
        [environment('production', ['dx'])],
        ['search'],
        false,
    );

    expect(headers(panel)).toEqual(['Project', 'Observed usage']);
    within(panel).getByRole('link', { name: 'search' });
    expect(
        within(panel).queryByRole('link', { name: 'dx' }),
    ).not.toBeInTheDocument();
});

test('explains an empty list, and why when a token reads all projects', () => {
    const panel = renderProjects(
        [environment('development', ['*']), environment('production', [])],
        [],
    );

    within(panel).getByText(
        "Projects this application's tokens can read, and projects its SDKs use.",
    );
    within(panel).getByText('No projects yet');
    within(panel).getByText(
        'Development tokens can read all projects, so only projects in use are listed.',
    );
    expect(within(panel).queryByRole('table')).not.toBeInTheDocument();
});

test('names every environment whose tokens read all projects', () => {
    const panel = renderProjects(
        [environment('development', ['*']), environment('staging', ['*'])],
        ['dx'],
    );

    within(panel).getByText(
        'Development and Staging tokens can read all projects, so only projects in use are listed.',
    );
});

test('says only SDK usage adds projects when not every token is visible', () => {
    const panel = renderProjects(
        [environment('production', ['dx'])],
        [],
        false,
    );

    within(panel).getByText('No projects yet');
    within(panel).getByText(
        'Projects appear here when an SDK uses their flags.',
    );
});
