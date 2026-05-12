import { expect, test, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { waitFor } from '@testing-library/react';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { GenerateApiKey } from './GenerateApiKey';

const server = testServerSetup();

const renderStep = (
    environment: string,
    onKeyGenerated: (apiKey: string | null) => void,
) =>
    render(
        <GenerateApiKey
            projectId='my-project'
            environments={['development', 'production']}
            environment={environment}
            onEnvSelect={vi.fn()}
            sdkType='client'
            onKeyGenerated={onKeyGenerated}
            onDone={vi.fn()}
        />,
    );

test('calls onKeyGenerated with null when switching to an environment with no token', async () => {
    testServerRoute(server, '/api/admin/projects/my-project/api-tokens', {
        tokens: [
            {
                environment: 'production',
                type: 'client',
                secret: 'my-project:production.secretxyz',
            },
        ],
    });

    const onKeyGenerated = vi.fn();
    const { rerender } = renderStep('production', onKeyGenerated);

    await waitFor(() => {
        expect(onKeyGenerated).toHaveBeenCalledWith(
            'my-project:production.secretxyz',
        );
    });

    onKeyGenerated.mockClear();

    rerender(
        <GenerateApiKey
            projectId='my-project'
            environments={['development', 'production']}
            environment='development'
            onEnvSelect={vi.fn()}
            sdkType='client'
            onKeyGenerated={onKeyGenerated}
            onDone={vi.fn()}
        />,
    );

    await waitFor(() => {
        expect(onKeyGenerated).toHaveBeenCalledWith(null);
    });
});
