import { describe, expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PendingAccessRequestsIndicator } from './PendingAccessRequestsIndicator.tsx';
import { mockPendingAccessRequest } from './accessRequestsTestServer.ts';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { enterprise: '1.0.0' } },
    });
    mockPendingAccessRequest(server);
};

describe('PendingAccessRequestsIndicator', () => {
    test('shows the dot for admins with pending requests', async () => {
        setupApi();

        render(<PendingAccessRequestsIndicator />, {
            permissions: [{ permission: ADMIN }],
        });

        expect(
            await screen.findByLabelText('Pending access requests'),
        ).toBeInTheDocument();
    });

    test('renders nothing for non-admin users even when requests exist', () => {
        setupApi();

        render(<PendingAccessRequestsIndicator />, {
            permissions: [],
        });

        expect(
            screen.queryByLabelText('Pending access requests'),
        ).not.toBeInTheDocument();
    });
});
