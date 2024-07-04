import { screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import CreateFeature from './CreateFeature';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { Route, Routes } from 'react-router-dom';
// test that the creation button is correctly disabled for the global flag limit and for the project flag limit.

// the tooltip on the button should tell you which limit you're hitting.

// if you're hitting both, mention the project limit first, because that would solve both problems? Actually, it won't because that error message says:
// Feature flag project limit reached. To be able to create more feature flags in this project please increase the feature flag upper limit in the project settings.
//
//If you're already at capacity globally, it won't help to increase the limit per project.
//
//

const server = testServerSetup();

const setupApi = ({
    flagCount,
    flagLimit,
}: { flagCount: number; flagLimit: number }) => {
    // set up routing for feature flag endpoint so we can get the data
    // also set up routing for project settings to get limits
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            resourceLimits: true,
        },
        resourceLimits: {
            featureFlags: flagLimit,
        },
    });

    testServerRoute(server, '/api/admin/???', {
        tokens: Array.from({ length: flagCount }).map((_, i) => ({
            secret: 'super-secret',
            tokenName: `token—name-${i}`,
            type: 'client',
        })),
    });
};

test('should allow you to create API tokens when there are fewer apiTokens than the limit', async () => {
    setupApi({ flagLimit: 3, flagCount: 2 });

    render(
        <Routes>
            <Route
                path='/projects/:projectId/create-toggle'
                element={<CreateFeature />}
            />
        </Routes>,
        {
            route: '/projects/default/create-toggle',
            permissions: [{ permission: CREATE_FEATURE }],
        },
    );

    screen.debug();

    await waitFor(async () => {
        const button = await screen.findByRole('button');
        expect(button).not.toBeDisabled();
    });
});
