import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { Route, Routes } from 'react-router-dom';
import { CreateFeatureDialog } from './CreateFeatureDialog.tsx';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        resourceLimits: { featureFlags: 999 },
        versionInfo: { current: { oss: 'version' } },
    });
    testServerRoute(server, '/api/admin/projects', { projects: [] });
    testServerRoute(server, '/api/admin/projects/default/overview', {
        environments: [],
        featureTypeCounts: [],
    });
    testServerRoute(server, '/api/admin/tags', { tags: [] });
    testServerRoute(server, '/api/admin/feature-types', { types: [] });
    testServerRoute(server, '/api/admin/search/features', {
        features: [],
        total: 0,
    });
};

test('shows URL friendly error when flag name contains unsafe characters', async () => {
    setupApi();
    testServerRoute(
        server,
        '/api/admin/features/validate',
        { details: [{ message: '"name" must be URL friendly' }] },
        'post',
        400,
    );

    render(
        <Routes>
            <Route
                path='/projects/:projectId'
                element={<CreateFeatureDialog open={true} onClose={() => {}} />}
            />
        </Routes>,
        {
            route: '/projects/default',
            permissions: [{ permission: CREATE_FEATURE }],
        },
    );

    const nameInput = await screen.findByRole('textbox', {
        name: /feature flag name/i,
    });

    fireEvent.change(nameInput, {
        target: { value: 'featureToggleUnsafe####$#//' },
    });
    fireEvent.blur(nameInput);

    await screen.findByText('"name" must be URL friendly');
});
