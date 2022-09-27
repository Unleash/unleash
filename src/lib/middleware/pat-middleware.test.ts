import getLogger from '../../test/fixtures/no-logger';
import { createTestConfig } from '../../test/config/test-config';
import patMiddleware from './pat-middleware';
import User from '../types/user';

let config: any;

beforeEach(() => {
    config = {
        getLogger,
        flagResolver: {
            isEnabled: jest.fn().mockReturnValue(true),
        },
    };
});

test('should not set user if unknown token', async () => {
    const userService = {
        getUserByPersonalAccessToken: jest.fn(),
    };

    const func = patMiddleware(config, { userService });

    const cb = jest.fn();

    const req = {
        header: jest.fn().mockReturnValue('user:some-token'),
        user: undefined,
    };

    await func(req, undefined, cb);

    expect(cb).toHaveBeenCalled();
    expect(req.header).toHaveBeenCalled();
    expect(req.user).toBeFalsy();
});

test('should not set user if token wrong format', async () => {
    const userService = {
        getUserByPersonalAccessToken: jest.fn(),
    };

    const func = patMiddleware(config, { userService });

    const cb = jest.fn();

    const req = {
        header: jest.fn().mockReturnValue('token-not-starting-with-user'),
        user: undefined,
    };

    await func(req, undefined, cb);

    expect(userService.getUserByPersonalAccessToken).not.toHaveBeenCalled();
    expect(cb).toHaveBeenCalled();
    expect(req.header).toHaveBeenCalled();
    expect(req.user).toBeFalsy();
});

test('should add user if known token', async () => {
    const apiUser = new User({
        id: 44,
        username: 'my-user',
    });
    const userService = {
        getUserByPersonalAccessToken: jest.fn().mockReturnValue(apiUser),
    };

    const func = patMiddleware(config, { userService });

    const cb = jest.fn();

    const req = {
        header: jest.fn().mockReturnValue('user:some-known-token'),
        user: undefined,
        path: '/api/client',
    };

    await func(req, undefined, cb);

    expect(cb).toHaveBeenCalled();
    expect(req.header).toHaveBeenCalled();
    expect(req.user).toBe(apiUser);
});

test('should not add user if disabled', async () => {
    const apiUser = new User({
        id: 44,
        username: 'my-user',
    });
    const userService = {
        getUserByPersonalAccessToken: jest.fn().mockReturnValue(apiUser),
    };

    const disabledConfig = createTestConfig({
        getLogger,
        experimental: {
            flags: {
                personalAccessTokens: false,
            },
        },
    });

    const func = patMiddleware(disabledConfig, { userService });

    const cb = jest.fn();

    const req = {
        header: jest.fn().mockReturnValue('user:some-known-token'),
        user: undefined,
    };

    await func(req, undefined, cb);

    expect(cb).toHaveBeenCalled();
    expect(req.user).toBeFalsy();
});

test('should call next if userService throws exception', async () => {
    getLogger.setMuteError(true);
    const userService = {
        getUserByPersonalAccessToken: () => {
            throw new Error('Error occurred');
        },
    };

    const func = patMiddleware(config, { userService });

    const cb = jest.fn();

    const req = {
        header: jest.fn().mockReturnValue('user:some-token'),
        user: undefined,
    };

    await func(req, undefined, cb);

    expect(cb).toHaveBeenCalled();
    getLogger.setMuteError(false);
});
