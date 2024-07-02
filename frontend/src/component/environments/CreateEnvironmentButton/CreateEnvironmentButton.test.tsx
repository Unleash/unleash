import { screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { CreateEnvironmentButton } from './CreateEnvironmentButton';
import { ADMIN } from 'component/providers/AccessProvider/permissions';

const server = testServerSetup();

const setupApi = ({
    environmentCount,
    environmentLimit,
}: { environmentCount: number; environmentLimit: number }) => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            resourceLimits: true,
            EEA: true,
        },
        resourceLimits: {
            environments: environmentLimit,
        },
    });

    testServerRoute(server, '/api/admin/environments', {
        environments: Array.from({ length: environmentCount }).map((_, i) => ({
            name: `environment-${i}`,
            type: 'production',
            enabled: i % 2 === 0,
        })),
    });
};

test('should allow you to create environments when there are fewer environments than the limit', async () => {
    setupApi({ environmentLimit: 5, environmentCount: 2 });

    render(<CreateEnvironmentButton />, {
        permissions: [{ permission: ADMIN }],
    });

    await waitFor(async () => {
        const button = await screen.findByRole('button');
        expect(button).not.toBeDisabled();
    });
});

test('should not allow you to create environments when you have reached the limit', async () => {
    setupApi({ environmentLimit: 5, environmentCount: 5 });
    render(<CreateEnvironmentButton />, {
        permissions: [{ permission: ADMIN }],
    });

    await waitFor(async () => {
        const button = await screen.findByRole('button');
        expect(button).toBeDisabled();
    });
});
