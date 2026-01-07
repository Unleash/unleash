import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ContextFieldUsage } from './ContextFieldUsage.tsx';

const server = testServerSetup();
const contextFieldName = 'appName';

const setupRoutes = () => {
    testServerRoute(
        server,
        `api/admin/context/${contextFieldName}/strategies`,
        {
            strategies: [
                {
                    id: '4b3ad603-4727-4782-bd61-efc530e37209',
                    projectId: 'faaa',
                    featureName: 'tests',
                    strategyName: 'flexibleRollout',
                    environment: 'development',
                },
            ],
        },
    );
    testServerRoute(server, '/api/admin/projects', {
        version: 1,
        projects: [
            {
                id: 'faaa',
            },
        ],
    });
};

test('should show usage of context field', async () => {
    setupRoutes();

    const contextFieldName = 'appName';
    render(<ContextFieldUsage contextName={contextFieldName} />);

    await screen.findByText('Usage of this context field:');
    await screen.findByText('tests (Gradual rollout)');
});
