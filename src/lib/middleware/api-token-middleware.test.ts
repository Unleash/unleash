import getLogger from '../../test/fixtures/no-logger';
import { CLIENT } from '../types/permissions';
import { createTestConfig } from '../../test/config/test-config';
import ApiUser from '../types/api-user';
import { ALL, ApiTokenType } from '../types/models/api-token';
import apiTokenMiddleware, {
    TOKEN_TYPE_ERROR_MESSAGE,
} from './api-token-middleware';

let config: any;

beforeEach(() => {
    config = {
        getLogger,
        authentication: {
            enableApiToken: true,
        },
    };
});

test('should not do anything if request does not contain a authorization', async () => {
    const apiTokenService = {
        getUserForToken: jest.fn(),
    };

    const func = apiTokenMiddleware(config, { apiTokenService });

    const cb = jest.fn();

    const req = {
        header: jest.fn(),
    };

    await func(req, undefined, cb);

    expect(req.header).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledTimes(1);
});

test('should not add user if unknown token', async () => {
    const apiTokenService = {
        getUserForToken: jest.fn(),
    };

    const func = apiTokenMiddleware(config, { apiTokenService });

    const cb = jest.fn();

    const req = {
        header: jest.fn().mockReturnValue('some-token'),
        user: undefined,
    };

    await func(req, undefined, cb);

    expect(cb).toHaveBeenCalled();
    expect(req.header).toHaveBeenCalled();
    expect(req.user).toBeFalsy();
});

test('should not make database query when provided PAT format', async () => {
    const apiTokenService = {
        getUserForToken: jest.fn(),
    };

    const func = apiTokenMiddleware(config, { apiTokenService });

    const cb = jest.fn();

    const req = {
        header: jest.fn().mockReturnValue('user:asdkjsdhg3'),
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
        username: 'default',
        permissions: [CLIENT],
        project: ALL,
        environment: ALL,
        type: ApiTokenType.CLIENT,
        secret: 'a',
    });
    const apiTokenService = {
        getUserForToken: jest.fn().mockReturnValue(apiUser),
    };

    const func = apiTokenMiddleware(config, { apiTokenService });

    const cb = jest.fn();

    const req = {
        header: jest.fn().mockReturnValue('some-known-token'),
        user: undefined,
        path: '/api/client',
    };

    await func(req, undefined, cb);

    expect(cb).toHaveBeenCalled();
    expect(req.header).toHaveBeenCalled();
    expect(req.user).toBe(apiUser);
});

test('should not add user if not /api/client', async () => {
    expect.assertions(5);

    const apiUser = new ApiUser({
        username: 'default',
        permissions: [CLIENT],
        project: ALL,
        environment: ALL,
        type: ApiTokenType.CLIENT,
        secret: 'a',
    });

    const apiTokenService = {
        getUserForToken: jest.fn().mockReturnValue(apiUser),
    };

    const func = apiTokenMiddleware(config, { apiTokenService });
    const cb = jest.fn();

    const res = {
        status: (code: unknown) => ({
            send: (data: unknown) => {
                expect(code).toEqual(403);
                expect(data).toEqual({ message: TOKEN_TYPE_ERROR_MESSAGE });
            },
        }),
    };

    const req = {
        header: jest.fn().mockReturnValue('some-known-token'),
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
        username: 'default',
        permissions: [CLIENT],
        project: ALL,
        environment: ALL,
        type: ApiTokenType.CLIENT,
        secret: 'a',
    });
    const apiTokenService = {
        getUserForToken: jest.fn().mockReturnValue(apiUser),
    };

    const disabledConfig = createTestConfig({
        getLogger,
        authentication: {
            enableApiToken: false,
            createAdminUser: false,
        },
    });

    const func = apiTokenMiddleware(disabledConfig, { apiTokenService });

    const cb = jest.fn();

    const req = {
        header: jest.fn().mockReturnValue('some-known-token'),
        user: undefined,
    };

    const send = jest.fn();
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
    };

    const func = apiTokenMiddleware(config, { apiTokenService });

    const cb = jest.fn();

    const req = {
        header: jest.fn().mockReturnValue('some-token'),
        user: undefined,
    };

    await func(req, undefined, cb);

    expect(cb).toHaveBeenCalled();
    getLogger.setMuteError(false);
});

test('should call next if apiTokenService throws x2', async () => {
    jest.spyOn(global.console, 'error').mockImplementation(() => jest.fn());
    const apiTokenService = {
        getUserForToken: () => {
            throw new Error('hi there, i am stupid');
        },
    };

    const func = apiTokenMiddleware(config, { apiTokenService });

    const cb = jest.fn();

    const req = {
        header: jest.fn().mockReturnValue('some-token'),
        user: undefined,
    };

    await func(req, undefined, cb);

    expect(cb).toHaveBeenCalled();
});
