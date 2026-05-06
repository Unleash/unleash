import { describe, expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { RemoteMcpAdmin } from './RemoteMcpAdmin.tsx';

describe('RemoteMcpAdmin', () => {
    const server = testServerSetup();

    test('shows not found when remoteMcpServer flag is off', async () => {
        testServerRoute(server, '/api/admin/ui-config', {
            flags: { remoteMcpServer: false },
        });

        render(<RemoteMcpAdmin />, { permissions: [{ permission: 'ADMIN' }] });

        expect(
            await screen.findByText(
                "Ooops. That's a page we haven't toggled on yet.",
            ),
        ).toBeInTheDocument();
        expect(screen.queryByText('Remote MCP Server')).not.toBeInTheDocument();
    });

    test('shows the page when remoteMcpServer flag is on', async () => {
        testServerRoute(server, '/api/admin/ui-config', {
            flags: { remoteMcpServer: true },
        });
        testServerRoute(server, '/api/admin/remote-mcp/settings', {
            enabled: false,
        });

        render(<RemoteMcpAdmin />, { permissions: [{ permission: 'ADMIN' }] });

        expect(
            await screen.findByText('Remote MCP Server'),
        ).toBeInTheDocument();
    });
});
