import { act, renderHook, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { SWRProvider } from 'component/providers/SWRProvider/SWRProvider';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { useInstanceStatus } from './useInstanceStatus.js';

const server = testServerSetup();

test('loads the instance status after the user logs in', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { UNLEASH_CLOUD: true },
    });
    testServerRoute(server, '/api/admin/user', {
        type: 'password',
        path: '/auth/simple/login',
        message: 'You must sign in order to use Unleash',
        defaultHidden: false,
        options: [],
    });
    testServerRoute(server, '/api/instance/status', {}, 'get', 401);
    const { result } = renderHook(
        () => ({ status: useInstanceStatus(), auth: useAuthUser() }),
        { wrapper: SWRProvider },
    );
    await waitFor(() => expect(result.current.status.loading).toBe(false));

    testServerRoute(server, '/api/admin/user', { user: { id: 1 } });
    testServerRoute(server, '/api/instance/status', { plan: 'Pro' });
    await act(async () => result.current.auth.refetchUser());

    await waitFor(() =>
        expect(result.current.status.instanceStatus).toMatchObject({
            plan: 'Pro',
        }),
    );
});
