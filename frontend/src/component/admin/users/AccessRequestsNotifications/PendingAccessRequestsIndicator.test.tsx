import { describe, expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PendingAccessRequestsIndicator } from './PendingAccessRequestsIndicator.tsx';

const server = testServerSetup();

const setupApi = ({ requests }: { requests: number }) => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { enterprise: '1.0.0' } },
    });
    testServerRoute(server, '/api/admin/user-access-requests', {
        userAccessRequests: Array.from({ length: requests }, (_, i) => ({
            id: String(i),
            email: `u${i}@test.com`,
            requestedAt: '2026-01-01T00:00:00Z',
        })),
    });
};

describe('PendingAccessRequestsIndicator', () => {
    test('shows the dot for admins with pending requests', async () => {
        setupApi({ requests: 1 });

        render(<PendingAccessRequestsIndicator />, {
            permissions: [{ permission: ADMIN }],
        });

        expect(
            await screen.findByLabelText('Pending access requests'),
        ).toBeInTheDocument();
    });

    test('renders nothing for non-admin users even when requests exist', () => {
        setupApi({ requests: 1 });

        render(<PendingAccessRequestsIndicator />, {
            permissions: [],
        });

        expect(
            screen.queryByLabelText('Pending access requests'),
        ).not.toBeInTheDocument();
    });
});
