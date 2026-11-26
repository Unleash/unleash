import { expect, test } from 'vitest';
import { screen, within } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ApplicationProjects } from './ApplicationProjects.tsx';

const server = testServerSetup();

const environment = (
    name: string,
    linkedProjects: string[],
    observedProjects: string[] = [],
) => ({
    name,
    enabled: true,
    instanceCount: 0,
    lastSeen: null,
    tokens: [],
    linked: linkedProjects.length > 0,
    linkedProjects,
    observedProjects,
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
    within(within(panel).getByRole('link', { name: project }).closest('tr')!)
        .getAllByRole('cell')
        .slice(1);

test('shows where each project is linked and whether it was observed', () => {
    const panel = renderProjects(
        [
            environment('production', ['dx', 'eg']),
            environment('staging', ['*']),
        ],
        ['dx', 'sa'],
    );

    within(panel).getByText('3 projects · 2 with observed usage');
    expect(headers(panel)).toEqual([
        'Project',
        'Production',
        'Staging',
        'Observed usage',
    ]);

    const [dxProduction, dxStaging, dxUsage] = cells(panel, 'dx');
    within(dxProduction).getByTitle('In a linked token');
    within(dxStaging).getByTitle('In a linked token');
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
    expect(
        within(panel).queryByRole('list', { name: 'Legend' }),
    ).not.toBeInTheDocument();
});
