import { expect, test, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { GenerateApiKey } from './GenerateApiKey';

const server = testServerSetup();

const renderComponent = (onApiKeyGenerated = vi.fn()) =>
    render(
        <GenerateApiKey
            projectId='my-project'
            environments={['development', 'production']}
            sdk={{ type: 'client' }}
            onApiKeyGenerated={onApiKeyGenerated}
        />,
    );

test('shows Generate API Key button when no token exists for the environment', async () => {
    testServerRoute(server, '/api/admin/projects/my-project/api-tokens', {
        tokens: [],
    });

    renderComponent();

    await waitFor(() => {
        expect(
            screen.getByRole('button', { name: /generate api key/i }),
        ).toBeInTheDocument();
    });
});

test('calls onApiKeyGenerated with token secret when clicking Next', async () => {
    testServerRoute(server, '/api/admin/projects/my-project/api-tokens', {
        tokens: [
            {
                environment: 'development',
                type: 'client',
                secret: 'my-project:development.secretxyz',
            },
        ],
    });

    const onApiKeyGenerated = vi.fn();
    renderComponent(onApiKeyGenerated);

    await waitFor(() => {
        expect(
            screen.getByRole('button', { name: /next/i }),
        ).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(onApiKeyGenerated).toHaveBeenCalledWith(
        'my-project:development.secretxyz',
    );
});
