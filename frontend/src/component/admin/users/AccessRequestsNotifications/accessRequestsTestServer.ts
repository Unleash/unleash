import type { SetupServer } from 'msw/node';
import { testServerRoute } from 'utils/testServer';

export const mockPendingAccessRequest = (server: SetupServer) =>
    testServerRoute(server, '/api/admin/user-access-requests', {
        userAccessRequests: [
            {
                id: '1',
                email: 'user@example.com',
                requestedAt: '2026-01-01T00:00:00Z',
            },
        ],
    });
