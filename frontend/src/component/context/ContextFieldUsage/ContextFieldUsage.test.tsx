import { render } from '../../../utils/testRenderer';
import { screen } from '@testing-library/react';
import React from 'react';
import { testServerRoute, testServerSetup } from '../../../utils/testServer';
import { UIProviderContainer } from '../../providers/UIProvider/UIProviderContainer';
import { ContextFieldUsage } from './ContextFieldUsage';

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
        }
    );
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            segmentContextFieldUsage: true,
        },
    });

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
    render(
        <UIProviderContainer>
            <ContextFieldUsage contextName={contextFieldName} />
        </UIProviderContainer>
    );

    await screen.findByText('Usage of this context field:');
    await screen.findByText('tests (Gradual rollout)');
});
