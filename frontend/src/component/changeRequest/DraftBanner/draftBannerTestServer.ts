import type { SetupServer } from 'msw/node';
import { testServerRoute } from 'utils/testServer';

export const mockDraftInDefaultProject = (
    server: SetupServer,
    { changeRequestEnabled }: { changeRequestEnabled: boolean },
) => {
    testServerRoute(
        server,
        '/api/admin/projects/default/change-requests/config',
        [{ environment: 'production', changeRequestEnabled }],
    );
    testServerRoute(
        server,
        '/api/admin/projects/default/change-requests/pending',
        [
            {
                id: 1,
                environment: 'production',
                state: 'Draft',
                features: [{ name: 'my-flag', changes: [{ id: 1 }] }],
                segments: [],
            },
        ],
    );
};
