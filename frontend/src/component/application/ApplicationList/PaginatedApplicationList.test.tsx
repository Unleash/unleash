import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { PaginatedApplicationList } from './PaginatedApplicationList.tsx';
import type { ApplicationSchema } from 'openapi';

const server = testServerSetup();

const setupApi = (applications: ApplicationSchema[]) => {
    testServerRoute(server, '/api/admin/metrics/applications', {
        applications,
        total: applications.length,
    });
    testServerRoute(server, '/api/admin/ui-config', {});
};

test('Display applications list', async () => {
    setupApi([{ appName: 'myApp1' }, { appName: 'myApp2' }]);
    render(<PaginatedApplicationList />);

    await screen.findByText('myApp1');
    await screen.findByText('myApp2');
    const nameColumn = screen.queryAllByText('Name')[0];

    nameColumn.click();
    expect(window.location.href).toContain(
        '?offset=0&sortBy=appName&sortOrder=desc',
    );
});

test('Display no applications connected', async () => {
    setupApi([]);
    render(<PaginatedApplicationList />);

    await screen.findByText(/To connect your application to Unleash/);
});
