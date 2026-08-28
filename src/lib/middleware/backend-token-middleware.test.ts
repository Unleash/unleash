import { createTestConfig } from '../../test/config/test-config.js';
import getLogger from '../../test/fixtures/no-logger.js';
import { vi } from 'vitest';
import type { ApiTokenService } from '../services/index.js';
import backendApiAccessMiddleware from './backend-token-middleware.js';
import { IAuthType } from '../server-impl.js';
import type { ReadOnlyApiTokenV2Service } from '../features/apitokensv2/index.js';
import ApiUser from '../types/api-user.js';
import { CLIENT } from '../types/permissions.js';
import { ApiTokenType } from '../types/model.js';
import { ALL } from '../types/models/api-token.js';

const validApiTokenV2 = `default:production.v2_${'a'.repeat(22)}_${'b'.repeat(
    43,
)}`;

test('with flag set client api should return 403 if user object is set and token is PAT', async () => {
    const localConfig = createTestConfig({
        getLogger,
        authentication: {
            enableApiToken: true,
            type: IAuthType.HOSTED,
        },
        experimental: {
            flags: {
                allowDeprecatedApiTokenMiddleware: false,
            },
        },
    });

    const apiTokenService = {
        getUserForToken: vi.fn(),
    } as unknown as ApiTokenService;
    const apiTokenV2Service = {
        getUserForToken: vi.fn(),
    } as unknown as ReadOnlyApiTokenV2Service;
    const func = backendApiAccessMiddleware(localConfig, {
        apiTokenService,
        apiTokenV2Service,
    });

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
            type: IAuthType.HOSTED,
        },
        experimental: {
            flags: {
                allowDeprecatedApiTokenMiddleware: false,
            },
        },
    });

    const apiTokenService = {
        getUserForToken: vi.fn(),
    } as unknown as ApiTokenService;
    const apiTokenV2Service = {
        getUserForToken: vi.fn(),
    } as unknown as ReadOnlyApiTokenV2Service;

    const func = backendApiAccessMiddleware(localConfig, {
        apiTokenService,
        apiTokenV2Service,
    });

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

test('uses the V2 verifier for V2 token format when secure token storage is disabled', async () => {
    const localConfig = createTestConfig({
        getLogger,
        authentication: {
            enableApiToken: true,
            type: IAuthType.HOSTED,
        },
        experimental: {
            flags: {
                allowDeprecatedApiTokenMiddleware: false,
                secureTokenStorage: false,
            },
        },
    });
    const apiUser = new ApiUser({
        tokenName: 'default',
        permissions: [CLIENT],
        project: ALL,
        environment: ALL,
        type: ApiTokenType.BACKEND,
        secret: 'selector',
    });
    const apiTokenService = {
        getUserForToken: vi.fn(),
    } as unknown as ApiTokenService;
    const apiTokenV2Service = {
        getUserForToken: vi.fn().mockResolvedValue(apiUser),
    } as unknown as ReadOnlyApiTokenV2Service;

    const func = backendApiAccessMiddleware(localConfig, {
        apiTokenService,
        apiTokenV2Service,
    });
    const cb = vi.fn();
    const res = {
        status: vi.fn().mockReturnValue({ send: vi.fn() }),
    };
    const req = {
        header: vi.fn().mockReturnValue(validApiTokenV2),
        user: undefined,
        path: '/api/client',
    };

    await func(req, res, cb);

    expect(apiTokenV2Service.getUserForToken).toHaveBeenCalledTimes(1);
    expect(apiTokenService.getUserForToken).not.toHaveBeenCalled();
    expect(req.user).toBe(apiUser);
    expect(cb).toHaveBeenCalledTimes(1);
});
