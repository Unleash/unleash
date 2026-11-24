import { expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ADMIN } from '@server/types/permissions';
import { CreateApplicationTokenButton } from './CreateApplicationTokenButton.tsx';

const server = testServerSetup();

test('cannot be clicked once the token limit is reached', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        resourceLimits: { apiTokens: 0 },
    });
    testServerRoute(server, '/api/admin/api-tokens', { tokens: [] });
    render(
        <CreateApplicationTokenButton onClick={() => {}}>
            Create token
        </CreateApplicationTokenButton>,
        { permissions: [{ permission: ADMIN }] },
    );

    const button = await screen.findByRole('button', { name: 'Create token' });
    await waitFor(() =>
        expect(button).toHaveAttribute('aria-disabled', 'true'),
    );
});
