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
                name: 'default',
                type: 'production',
                sortOrder: 1,
                enabled: false,
                protected: true,
                projectCount: 0,
                apiTokenCount: 1,
                enabledToggleCount: 0,
            },
            {
                name: 'development',
                type: 'development',
                sortOrder: 2,
                enabled: true,
                protected: false,
                projectCount: 49,
                apiTokenCount: 24353,
                enabledToggleCount: 20,
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
