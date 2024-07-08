import { screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import CreateFeature from './CreateFeature';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { Route, Routes } from 'react-router-dom';

const server = testServerSetup();

const setupApi = ({
    flagCount,
    flagLimit,
}: { flagCount: number; flagLimit: number }) => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            resourceLimits: true,
        },
        resourceLimits: {
            featureFlags: flagLimit,
        },
    });

    testServerRoute(server, '/api/admin/search/features', {
        total: flagCount,
        features: Array.from({ length: flagCount }).map((_, i) => ({
            name: `flag-${i}`,
        })),
    });
};

describe('button states', () => {
    test("should allow you to create feature flags when you're below the global limit", async () => {
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

        const button = await screen.findByRole('button', {
            name: /create feature flag/i,
        });
        await waitFor(() => {
            expect(button).not.toBeDisabled();
        });
    });

    test("should not allow you to create feature flags when you're at the global limit", async () => {
        setupApi({ flagLimit: 3, flagCount: 3 });

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

        const button = await screen.findByRole('button', {
            name: /create feature flag/i,
        });
        await waitFor(() => {
            expect(button).toBeDisabled();
        });
    });
});

describe('limit component', () => {
    test('should show limit reached info', async () => {
        setupApi({ flagLimit: 1, flagCount: 1 });
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

        await screen.findByText('You have reached the limit for feature flags');
    });

    test('should show approaching limit info', async () => {
        setupApi({ flagLimit: 10, flagCount: 9 });
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

        await screen.findByText('You are nearing the limit for feature flags');
    });
});
