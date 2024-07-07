import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from '../../../utils/testServer';
import CreateEnvironment from './CreateEnvironment';
import { ADMIN } from '../../providers/AccessProvider/permissions';

const server = testServerSetup();

const setupApi = ({
    resourceLimits,
    limit,
    environments,
}: { resourceLimits: boolean; limit: number; environments: number }) => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            resourceLimits,
        },
        resourceLimits: {
            environments: limit,
        },
    });

    testServerRoute(server, '/api/admin/environments', {
        environments: [...Array(environments).keys()].map((i) => ({
            name: `environment${i}`,
        })),
    });
};

test('show limit reached info', async () => {
    setupApi({ environments: 1, limit: 1, resourceLimits: true });
    render(<CreateEnvironment />, { permissions: [{ permission: ADMIN }] });

    await screen.findByText('You have reached the limit for environments');
    const createButton = await screen.findByText('Create environment', {
        selector: 'button',
    });
    expect(createButton).toBeDisabled();
});

test('show approaching limit info', async () => {
    setupApi({ environments: 9, limit: 10, resourceLimits: true });
    render(<CreateEnvironment />, { permissions: [{ permission: ADMIN }] });

    await screen.findByText('You are nearing the limit for environments');
    const createButton = await screen.findByText('Create environment', {
        selector: 'button',
    });
    expect(createButton).toBeEnabled();
});

test('show limit reached info - no resource limits component', async () => {
    setupApi({ environments: 1, limit: 1, resourceLimits: false });
    render(<CreateEnvironment />);

    await screen.findByText('Go back');
});
