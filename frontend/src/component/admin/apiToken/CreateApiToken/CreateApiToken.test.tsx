import { render } from 'utils/testRenderer';
import { screen, waitFor } from '@testing-library/react';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { CreateApiToken } from './CreateApiToken.tsx';
import {
    ADMIN,
    CREATE_CLIENT_API_TOKEN,
    CREATE_FRONTEND_API_TOKEN,
} from '@server/types/permissions';

const permissions = [
    { permission: CREATE_CLIENT_API_TOKEN },
    { permission: CREATE_FRONTEND_API_TOKEN },
    { permission: ADMIN },
];

const server = testServerSetup();

const setupApi = (existingTokensCount: number) => {
    testServerRoute(server, '/api/admin/ui-config', {
        resourceLimits: {
            apiTokens: 1,
        },
        versionInfo: {
            current: { enterprise: 'version' },
        },
    });

    testServerRoute(server, '/api/admin/api-tokens', {
        tokens: [...Array(existingTokensCount).keys()].map((_, i) => ({
            secret: `token${i}`,
        })),
    });
};

test('Enabled new token button when limits, version and permission allow for it', async () => {
    setupApi(0);
    render(<CreateApiToken />, {
        permissions,
    });

    await waitFor(async () => {
        const button = await screen.findByText('Create token');
        expect(button).not.toHaveAttribute('aria-disabled');
    });
});

test('Token limit reached', async () => {
    setupApi(1);
    render(<CreateApiToken />, {
        permissions,
    });

    await screen.findByText('You have reached the limit for API tokens');

    const button = await screen.findByText('Create token');
    expect(button).toHaveAttribute('aria-disabled', 'true');
});
