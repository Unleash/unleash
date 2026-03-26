import { createTestConfig } from '../../test/config/test-config.js';
import getLogger from '../../test/fixtures/no-logger.js';
import { vi } from 'vitest';
import type { ApiTokenService } from '../services/index.js';
import backendApiAccessMiddleware from './backend-token-middleware.js';

test('with flag set client api should return 403 if user object is set and token is PAT', async () => {
    const localConfig = createTestConfig({
        getLogger,
        authentication: {
            enableApiToken: true,
        },
        experimental: {
            flags: {
                onlyFeatureTokensWithFeatureAPIs: true,
            },
        },
    });

    const apiTokenService = {
        getUserForToken: vi.fn(),
    } as unknown as ApiTokenService;

    const func = backendApiAccessMiddleware(localConfig, { apiTokenService });

    const cb = vi.fn();
    const user = { accountType: 'User', id: 1, username: 'PAT-Owner' };

    const req = {
        header: vi.fn().mockReturnValue('user:some-pat-token'),
        user,
        path: '/api/client',
    };

    const res = {
        status: vi.fn().mockReturnValue({
            send: vi.fn(),
        }),
    };

    await func(req, res, cb);

    expect(cb).not.toHaveBeenCalled();
    expect(req.header).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
});

test.each([
    'user:asdkjsdhg3',
    '*:*.asdf',
])('%s PAT format tokens with client api cause middleware to return 403 when flag is set', async (rejectedToken) => {
    const localConfig = createTestConfig({
        getLogger,
        authentication: {
            enableApiToken: true,
        },
        experimental: {
            flags: {
                onlyFeatureTokensWithFeatureAPIs: true,
            },
        },
    });

    const apiTokenService = {
        getUserForToken: vi.fn(),
    } as unknown as ApiTokenService;

    const func = backendApiAccessMiddleware(localConfig, { apiTokenService });

    const cb = vi.fn();
    const res = {
        status: vi.fn().mockReturnValue({ send: vi.fn() }),
    };

    const req = {
        header: vi.fn().mockReturnValue(rejectedToken),
        user: undefined,
        path: '/api/client/metrics',
    };

    await func(req, res, cb);

    expect(apiTokenService.getUserForToken).not.toHaveBeenCalled();
    expect(req.header).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(cb).not.toHaveBeenCalled();
    expect(req.user).toBeFalsy();
});
