import { render } from '../../../../utils/testRenderer';
import { screen } from '@testing-library/react';
import React from 'react';
import { testServerRoute, testServerSetup } from '../../../../utils/testServer';
import { UIProviderContainer } from 'component/providers/UIProvider/UIProviderContainer';
import ContextList from './ContextList';

const server = testServerSetup();

const setupRoutes = () => {
    testServerRoute(server, 'api/admin/context', [
        {
            description: 'Allows you to constrain on application name',
            legalValues: [],
            name: 'appName',
            sortOrder: 2,
            stickiness: false,
            usedInProjects: 3,
            usedInFeatures: 2,
            createdAt: '2023-05-24T06:23:07.797Z',
        },
    ]);
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
            <ContextList />
        </UIProviderContainer>
    );

    await screen.findByText('2 feature toggles');
    await screen.findByText('3 projects');
});
