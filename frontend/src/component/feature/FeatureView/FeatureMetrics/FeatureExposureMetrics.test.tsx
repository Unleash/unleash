import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { FeatureExposureMetrics } from './FeatureExposureMetrics.tsx';
import { Route, Routes } from 'react-router-dom';

describe('FeatureExposureMetrics – default production selection', () => {
    const server = testServerSetup();
    const PROJECT_ID = 'default';
    const FEATURE_ID = 'feature_name';
    const ROUTE = `/projects/${PROJECT_ID}/features/${FEATURE_ID}/metrics`;
    const PATH = `/projects/:projectId/features/:featureId/metrics`;

    it('returns the name of the first production env (prod in middle)', async () => {
        testServerRoute(
            server,
            `/api/admin/projects/${PROJECT_ID}/features/${FEATURE_ID}?variantEnvironments=true`,
            {
                environments: [
                    {
                        name: 'development',
                        type: 'development',
                        sortOrder: 2,
                    },
                    {
                        name: 'production-1',
                        type: 'production',
                        sortOrder: 3,
                    },
                    {
                        name: 'production-2',
                        type: 'production',
                        sortOrder: 4,
                    },
                ],
            },
        );

        render(
            <Routes>
                <Route path={PATH} element={<FeatureExposureMetrics />} />
            </Routes>,
            { route: ROUTE },
        );

        const selectedChip = await screen.findByTestId(
            'selected-chip-production-1',
        );
        expect(selectedChip).toHaveAttribute('aria-pressed', 'true');
        expect(selectedChip).toHaveTextContent('production-1');
    });

    it('returns the first environment if production is not in the list', async () => {
        testServerRoute(
            server,
            `/api/admin/projects/${PROJECT_ID}/features/${FEATURE_ID}?variantEnvironments=true`,
            {
                environments: [
                    {
                        name: 'development-1',
                        type: 'development',
                        sortOrder: 2,
                    },
                    {
                        name: 'development-2',
                        type: 'development',
                        sortOrder: 3,
                    },
                ],
            },
        );

        render(
            <Routes>
                <Route path={PATH} element={<FeatureExposureMetrics />} />
            </Routes>,
            { route: ROUTE },
        );

        const selectedChip = await screen.findByTestId(
            'selected-chip-development-1',
        );
        expect(selectedChip).toHaveAttribute('aria-pressed', 'true');
        expect(selectedChip).toHaveTextContent('development-1');
    });
});
