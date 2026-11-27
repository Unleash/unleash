import { expect, test } from 'vitest';
import { screen, within } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { PageBreadcrumbs } from './PageBreadcrumbs.tsx';

const server = testServerSetup();

test('shows the mode badge next to the project name in the breadcrumb trail', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { oss: 'version' } },
    });
    testServerRoute(server, '/api/admin/projects', {
        projects: [{ id: 'default', name: 'Default', mode: 'private' }],
    });

    render(<PageBreadcrumbs />, { route: '/projects/default/change-requests' });

    const projectBreadcrumb = await screen.findByRole('link', {
        name: 'Default Private project',
    });
    expect(
        within(projectBreadcrumb).getByRole('img', { name: 'Private project' }),
    ).toBeInTheDocument();
});
