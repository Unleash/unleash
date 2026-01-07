import { screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { CreateApiTokenButton } from './CreateApiTokenButton.tsx';
import { CREATE_PROJECT_API_TOKEN } from 'component/providers/AccessProvider/permissions';

const server = testServerSetup();

const setupApi = ({
    apiTokenCount,
    apiTokenLimit,
}: {
    apiTokenCount: number;
    apiTokenLimit: number;
}) => {
    testServerRoute(server, '/api/admin/ui-config', {
        resourceLimits: { apiTokens: apiTokenLimit },
    });

    testServerRoute(server, '/api/admin/api-tokens', {
        tokens: Array.from({ length: apiTokenCount }).map((_, i) => ({
            secret: 'super-secret',
            tokenName: `token—name-${i}`,
            type: 'client',
        })),
    });
};

test('should allow you to create API tokens when there are fewer apiTokens than the limit', async () => {
    setupApi({ apiTokenLimit: 3, apiTokenCount: 2 });

    render(
        <CreateApiTokenButton
            permission={CREATE_PROJECT_API_TOKEN}
            path='create'
        />,
        {
            permissions: [{ permission: CREATE_PROJECT_API_TOKEN }],
        },
    );

    await waitFor(async () => {
        const button = await screen.findByRole('button');
        expect(button).not.toBeDisabled();
    });
});

test('should not allow you to create API tokens when you have reached the limit', async () => {
    setupApi({ apiTokenLimit: 3, apiTokenCount: 3 });

    render(
        <CreateApiTokenButton
            permission={CREATE_PROJECT_API_TOKEN}
            path='create'
        />,
        {
            permissions: [{ permission: CREATE_PROJECT_API_TOKEN }],
        },
    );

    await waitFor(async () => {
        const button = await screen.findByRole('button');
        expect(button).toHaveAttribute('aria-disabled', 'true');
    });
});
