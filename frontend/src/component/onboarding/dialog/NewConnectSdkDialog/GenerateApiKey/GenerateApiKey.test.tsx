import { expect, test, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { GenerateApiKey } from './GenerateApiKey';

const server = testServerSetup();

const renderComponent = (onApiKeyChange = vi.fn(), onNext = vi.fn()) =>
    render(
        <GenerateApiKey
            projectId='my-project'
            environments={['development', 'production']}
            sdk={{ type: 'client' }}
            onApiKeyChange={onApiKeyChange}
            onNext={onNext}
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

test('calls onApiKeyChange with token secret when a token becomes available', async () => {
    testServerRoute(server, '/api/admin/projects/my-project/api-tokens', {
        tokens: [
            {
                environment: 'development',
                type: 'client',
                secret: 'my-project:development.secretxyz',
            },
        ],
    });

    const onApiKeyChange = vi.fn();
    renderComponent(onApiKeyChange);

    await waitFor(() => {
        expect(onApiKeyChange).toHaveBeenCalledWith(
            'my-project:development.secretxyz',
        );
    });
});

test('calls onApiKeyChange with undefined when user switches to environment without a token', async () => {
    testServerRoute(server, '/api/admin/projects/my-project/api-tokens', {
        tokens: [
            {
                environment: 'development',
                type: 'client',
                secret: 'my-project:development.secretxyz',
            },
        ],
    });

    const onApiKeyChange = vi.fn();
    renderComponent(onApiKeyChange);

    await waitFor(() => {
        expect(onApiKeyChange).toHaveBeenCalledWith(
            'my-project:development.secretxyz',
        );
    });

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: 'production' }));

    await waitFor(() => {
        expect(onApiKeyChange).toHaveBeenCalledWith(undefined);
    });
});

test('calls onNext when clicking Next', async () => {
    testServerRoute(server, '/api/admin/projects/my-project/api-tokens', {
        tokens: [
            {
                environment: 'development',
                type: 'client',
                secret: 'my-project:development.secretxyz',
            },
        ],
    });

    const onNext = vi.fn();
    renderComponent(vi.fn(), onNext);

    await waitFor(() => {
        expect(
            screen.getByRole('button', { name: /next/i }),
        ).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(onNext).toHaveBeenCalled();
});
