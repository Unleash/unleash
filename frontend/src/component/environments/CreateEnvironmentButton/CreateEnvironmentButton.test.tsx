import { screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { CreateEnvironmentButton } from './CreateEnvironmentButton';
import { ADMIN } from 'component/providers/AccessProvider/permissions';

const server = testServerSetup();

const setupApi = (environmentsLimit: number) => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            resourceLimits: true,
            EEA: true,
        },
        resourceLimits: {
            environments: environmentsLimit,
        },
    });

    testServerRoute(server, '/api/admin/environments', {
        environments: [
            {
                name: 'production',
                type: 'production',
                enabled: false,
            },
            {
                name: 'development',
                type: 'development',
                enabled: true,
            },
        ],
    });
};

test('should allow you to create environments when there are fewer environments than the limit', async () => {
    setupApi(5);

    render(<CreateEnvironmentButton />, {
        permissions: [{ permission: ADMIN }],
    });

    await waitFor(async () => {
        const button = await screen.findByRole('button');
        expect(button).not.toBeDisabled();
    });
});

test('should not allow you to create environments when you have reached the limit', async () => {
    setupApi(2);
    render(<CreateEnvironmentButton />, {
        permissions: [{ permission: ADMIN }],
    });

    await waitFor(async () => {
        const button = await screen.findByRole('button');
        expect(button).toBeDisabled();
    });
});
