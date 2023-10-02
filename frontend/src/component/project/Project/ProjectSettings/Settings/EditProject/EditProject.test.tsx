import { screen } from '@testing-library/react';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { render } from 'utils/testRenderer';
import { UIProviderContainer } from 'component/providers/UIProvider/UIProviderContainer';
import EditProject from './EditProject';
import { Route, Routes } from 'react-router-dom';
import { UPDATE_PROJECT } from 'component/providers/AccessProvider/permissions';

const server = testServerSetup();

test('should not show enterprise setting form when pro', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        environment: 'pro',
    });

    render(
        <UIProviderContainer>
            <Routes>
                <Route
                    path={`/projects/:projectId/settings`}
                    element={<EditProject />}
                />
            </Routes>
        </UIProviderContainer>,

        {
            route: `/projects/default/settings`,
            permissions: [{ permission: UPDATE_PROJECT, project: 'default' }],
        }
    );

    expect(screen.queryByText('Enterprise Settings')).not.toBeInTheDocument();
});
