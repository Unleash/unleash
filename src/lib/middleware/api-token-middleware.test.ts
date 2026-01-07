import getLogger from '../../test/fixtures/no-logger.js';
import { CLIENT } from '../types/permissions.js';
import { createTestConfig } from '../../test/config/test-config.js';
import ApiUser from '../types/api-user.js';
import { ALL } from '../types/models/api-token.js';
import { ApiTokenType } from '../types/model.js';
import apiTokenMiddleware, {
    TOKEN_TYPE_ERROR_MESSAGE,
} from './api-token-middleware.js';
import type { ApiTokenService } from '../services/index.js';
import type { IUnleashConfig } from '../types/index.js';
import { vi } from 'vitest';

let config: IUnleashConfig;

beforeEach(() => {
    config = createTestConfig({
        getLogger,
        authentication: {
            enableApiToken: true,
        },
    });
});

test('should not do anything if request does not contain a authorization', async () => {
    const apiTokenService = {
        getUserForToken: vi.fn(),
    } as unknown as ApiTokenService;

    const func = apiTokenMiddleware(config, { apiTokenService });

    const cb = vi.fn();

    const req = {
        header: vi.fn(),
    };

    await func(req, undefined, cb);

    expect(req.header).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledTimes(1);
});

test('should not add user if unknown token', async () => {
    const apiTokenService = {
        getUserForToken: vi.fn(),
    } as unknown as ApiTokenService;

    const func = apiTokenMiddleware(config, { apiTokenService });

    const cb = vi.fn();

    const req = {
        header: vi.fn().mockReturnValue('some-token'),
        user: undefined,
    };

    await func(req, undefined, cb);

    expect(cb).toHaveBeenCalled();
    expect(req.header).toHaveBeenCalled();
    expect(req.user).toBeFalsy();
});

test('should not make database query when provided PAT format', async () => {
    const apiTokenService = {
        getUserForToken: vi.fn(),
    } as unknown as ApiTokenService;

    const func = apiTokenMiddleware(config, { apiTokenService });

    const cb = vi.fn();

    const req = {
        header: vi.fn().mockReturnValue('user:asdkjsdhg3'),
        user: undefined,
    };

    await func(req, undefined, cb);

    expect(apiTokenService.getUserForToken).not.toHaveBeenCalled();
    expect(req.header).toHaveBeenCalled();
    expect(cb).toHaveBeenCalled();
    expect(req.user).toBeFalsy();
});

test('should add user if known token', async () => {
    const apiUser = new ApiUser({
        tokenName: 'default',
        permissions: [CLIENT],
        project: ALL,
        environment: ALL,
        type: ApiTokenType.BACKEND,
        secret: 'a',
    });
    const apiTokenService = {
        getUserForToken: vi.fn().mockReturnValue(apiUser),
    } as unknown as ApiTokenService;

    const func = apiTokenMiddleware(config, { apiTokenService });

    const cb = vi.fn();

    const req = {
        header: vi.fn().mockReturnValue('some-known-token'),
        user: undefined,
        path: '/api/client',
    };

    await func(req, undefined, cb);

    expect(cb).toHaveBeenCalled();
    expect(req.header).toHaveBeenCalled();
    expect(req.user).toBe(apiUser);
});

test.each([
    ApiTokenType.CLIENT,
    ApiTokenType.BACKEND,
])('should not add user if not /api/client with token type %s', async (type) => {
    expect.assertions(5);

    const apiUser = new ApiUser({
        tokenName: 'default',
        permissions: [CLIENT],
        project: ALL,
        environment: ALL,
        type,
        secret: 'a',
    });

    const apiTokenService = {
        getUserForToken: vi.fn().mockReturnValue(apiUser),
    } as unknown as ApiTokenService;

    const func = apiTokenMiddleware(config, { apiTokenService });
    const cb = vi.fn();

    const res = {
        status: (code: unknown) => ({
            send: (data: unknown) => {
                expect(code).toEqual(403);
                expect(data).toEqual({ message: TOKEN_TYPE_ERROR_MESSAGE });
            },
        }),
    };

    const req = {
        header: vi.fn().mockReturnValue('some-known-token'),
        user: undefined,
        path: '/api/admin',
    };

    await func(req, res, cb);

    expect(cb).not.toHaveBeenCalled();
    expect(req.header).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
});

test('should not add user if disabled', async () => {
    const apiUser = new ApiUser({
        tokenName: 'default',
        permissions: [CLIENT],
        project: ALL,
        environment: ALL,
        type: ApiTokenType.BACKEND,
        secret: 'a',
    });
    const apiTokenService = {
        getUserForToken: vi.fn().mockReturnValue(apiUser),
    } as unknown as ApiTokenService;

    const disabledConfig = createTestConfig({
        getLogger,
        authentication: {
            enableApiToken: false,
            createAdminUser: false,
        },
    });

    const func = apiTokenMiddleware(disabledConfig, { apiTokenService });

    const cb = vi.fn();

    const req = {
        header: vi.fn().mockReturnValue('some-known-token'),
        user: undefined,
    };

    const send = vi.fn();
    const res = {
        status: () => {
            return {
                send: send,
            };
        },
    };

    await func(req, res, cb);

    expect(send).not.toHaveBeenCalled();
    expect(cb).toHaveBeenCalled();
    expect(req.user).toBeFalsy();
});

test('should call next if apiTokenService throws', async () => {
    getLogger.setMuteError(true);
    const apiTokenService = {
        getUserForToken: () => {
            throw new Error('hi there, i am stupid');
        },
    } as unknown as ApiTokenService;

    const func = apiTokenMiddleware(config, { apiTokenService });

    const cb = vi.fn();

    const req = {
        header: vi.fn().mockReturnValue('some-token'),
        user: undefined,
    };

    await func(req, undefined, cb);

    expect(cb).toHaveBeenCalled();
    getLogger.setMuteError(false);
});

test('should call next if apiTokenService throws x2', async () => {
    vi.spyOn(global.console, 'error').mockImplementation(() => vi.fn());
    const apiTokenService = {
        getUserForToken: () => {
            throw new Error('hi there, i am stupid');
        },
    } as unknown as ApiTokenService;

    const func = apiTokenMiddleware(config, { apiTokenService });

    const cb = vi.fn();

    const req = {
        header: vi.fn().mockReturnValue('some-token'),
        user: undefined,
    };

    await func(req, undefined, cb);

    expect(cb).toHaveBeenCalled();
});

test('should add user if client token and /edge/metrics', async () => {
    const apiUser = new ApiUser({
        tokenName: 'default',
        permissions: [CLIENT],
        project: ALL,
        environment: ALL,
        type: ApiTokenType.BACKEND,
        secret: 'a',
    });
    const apiTokenService = {
        getUserForToken: vi.fn().mockReturnValue(apiUser),
    } as unknown as ApiTokenService;

    const func = apiTokenMiddleware(config, { apiTokenService });

    const cb = vi.fn();

    const req = {
        header: vi.fn().mockReturnValue('some-known-token'),
        user: undefined,
        path: '/edge/metrics',
        method: 'POST',
    };

    await func(req, undefined, cb);

    expect(cb).toHaveBeenCalled();
    expect(req.header).toHaveBeenCalled();
    expect(req.user).toBe(apiUser);
});
