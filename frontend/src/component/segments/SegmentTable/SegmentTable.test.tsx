import { render } from '../../../utils/testRenderer';
import { screen } from '@testing-library/react';
import React from 'react';
import { SegmentTable } from './SegmentTable';
import { testServerRoute, testServerSetup } from '../../../utils/testServer';
import { UIProviderContainer } from '../../providers/UIProvider/UIProviderContainer';

const server = testServerSetup();

const setupRoutes = () => {
    testServerRoute(server, 'api/admin/segments', {
        segments: [
            {
                id: 2,
                name: 'test2',
                description: '',
                usedInProjects: 3,
                usedInFeatures: 2,
                constraints: [],
                createdBy: 'admin',
                createdAt: '2023-05-24T06:23:07.797Z',
            },
        ],
    });
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            SE: true,
            segmentContextFieldUsage: true,
        },
    });
};

test('should show the count of projects and features used in', async () => {
    setupRoutes();

    render(
        <UIProviderContainer>
            <SegmentTable />
        </UIProviderContainer>
    );

    await screen.findByText('2 feature toggles');
    await screen.findByText('3 projects');
});
