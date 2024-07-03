import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { SegmentTable } from './SegmentTable';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { CREATE_SEGMENT } from '../../providers/AccessProvider/permissions';

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
            resourceLimits: true,
        },
        resourceLimits: {
            segments: 2,
        },
    });
};

test('should show the count of projects and features used in', async () => {
    setupRoutes();

    render(<SegmentTable />, { permissions: [{ permission: CREATE_SEGMENT }] });

    const loadingSegment = await screen.findByText('New segment');
    expect(loadingSegment).toBeDisabled();

    await screen.findByText('2 feature flags');
    await screen.findByText('3 projects');

    const segment = await screen.findByText('New segment');
    expect(segment).not.toBeDisabled();
});
