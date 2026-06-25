import { describe, expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PendingAccessRequestsIndicator } from './PendingAccessRequestsIndicator.tsx';

const server = testServerSetup();

const setupApi = ({ flag, requests }: { flag: boolean; requests: number }) => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { accessRequestsMenuIndicator: flag },
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
    test('shows the dot when admin, flag enabled, and there are pending requests', async () => {
        setupApi({ flag: true, requests: 1 });

        render(<PendingAccessRequestsIndicator />, {
            permissions: [{ permission: ADMIN }],
        });

        expect(
            await screen.findByLabelText('Pending access requests'),
        ).toBeInTheDocument();
    });

    test('renders nothing when the flag is disabled', async () => {
        setupApi({ flag: false, requests: 1 });

        render(<PendingAccessRequestsIndicator />, {
            permissions: [{ permission: ADMIN }],
        });

        // SWR resolves async; assert the dot never appears.
        await waitFor(() =>
            expect(
                screen.queryByLabelText('Pending access requests'),
            ).not.toBeInTheDocument(),
        );
    });

    test('renders nothing for non-admin users', async () => {
        setupApi({ flag: true, requests: 1 });

        render(<PendingAccessRequestsIndicator />, {
            permissions: [],
        });

        await waitFor(() =>
            expect(
                screen.queryByLabelText('Pending access requests'),
            ).not.toBeInTheDocument(),
        );
    });
});
