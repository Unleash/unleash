import { describe, expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { RemoteMcpAdmin } from './RemoteMcpAdmin.tsx';

describe('RemoteMcpAdmin', () => {
    const server = testServerSetup();

    test('shows the page on the Enterprise plan', async () => {
        testServerRoute(server, '/api/admin/ui-config', {
            environment: 'Enterprise',
            versionInfo: { current: { enterprise: 'version' } },
        });
        testServerRoute(server, '/api/admin/remote-mcp/settings', {
            enabled: false,
        });

        render(<RemoteMcpAdmin />, { permissions: [{ permission: 'ADMIN' }] });

        expect(
            await screen.findByText('Remote MCP Server'),
        ).toBeInTheDocument();
    });

    test('shows an upgrade prompt instead of the page on a non-enterprise plan', async () => {
        testServerRoute(server, '/api/admin/ui-config', {
            environment: 'Pro',
            versionInfo: { current: { enterprise: 'version' } },
        });

        render(<RemoteMcpAdmin />, { permissions: [{ permission: 'ADMIN' }] });

        expect(
            await screen.findByText('Enterprise feature'),
        ).toBeInTheDocument();
        expect(screen.queryByText('Remote MCP Server')).not.toBeInTheDocument();
    });
});
