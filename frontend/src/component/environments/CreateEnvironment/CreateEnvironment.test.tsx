import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import CreateEnvironment from './CreateEnvironment.tsx';
import { ADMIN } from '../../providers/AccessProvider/permissions.ts';

const server = testServerSetup();

const setupApi = ({
    limit,
    environments,
}: {
    limit: number;
    environments: number;
}) => {
    testServerRoute(server, '/api/admin/ui-config', {
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
    setupApi({ environments: 1, limit: 1 });
    render(<CreateEnvironment />, { permissions: [{ permission: ADMIN }] });

    await screen.findByText('You have reached the limit for environments');
    const createButton = await screen.findByText('Create environment', {
        selector: 'button',
    });
    expect(createButton).toHaveAttribute('aria-disabled', 'true');
});

test('show approaching limit info', async () => {
    setupApi({ environments: 9, limit: 10 });
    render(<CreateEnvironment />, { permissions: [{ permission: ADMIN }] });

    await screen.findByText('You are nearing the limit for environments');
    const createButton = await screen.findByText('Create environment', {
        selector: 'button',
    });
    expect(createButton).toBeEnabled();
});
