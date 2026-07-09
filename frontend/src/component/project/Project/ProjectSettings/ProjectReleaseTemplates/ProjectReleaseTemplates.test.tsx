import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { render } from 'utils/testRenderer';
import { expect, test } from 'vitest';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ProjectReleaseTemplates } from './ProjectReleaseTemplates.tsx';

const server = testServerSetup();

test('renders the templates returned for the project', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { enterprise: '1.0.0' } },
        flags: { projectReleaseTemplates: true },
    });
    testServerRoute(
        server,
        '/api/admin/projects/my-project/release-templates',
        [
            { id: '1', name: 'Project template 1' },
            { id: '2', name: 'Project template 2' },
        ],
    );

    render(
        <Routes>
            <Route
                path='/projects/:projectId/settings/release-templates/*'
                element={<ProjectReleaseTemplates />}
            />
        </Routes>,
        { route: '/projects/my-project/settings/release-templates' },
    );

    expect(await screen.findByText('Project template 1')).toBeInTheDocument();
    expect(screen.getByText('Project template 2')).toBeInTheDocument();
});
