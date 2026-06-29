import { describe, expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { RemoteMcpAdmin } from './RemoteMcpAdmin.tsx';

describe('RemoteMcpAdmin', () => {
    const server = testServerSetup();

    test('shows the page', async () => {
        testServerRoute(server, '/api/admin/remote-mcp/settings', {
            enabled: false,
        });

        render(<RemoteMcpAdmin />, { permissions: [{ permission: 'ADMIN' }] });

        expect(
            await screen.findByText('Remote MCP Server'),
        ).toBeInTheDocument();
    });
});
