import getLogger from '../../test/fixtures/no-logger';
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
    const accountService = {
        getAccountByPersonalAccessToken: jest.fn(),
    };

    const func = patMiddleware(config, { accountService });

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
    const accountService = {
        getAccountByPersonalAccessToken: jest.fn(),
    };

    const func = patMiddleware(config, { accountService });

    const cb = jest.fn();

    const req = {
        header: jest.fn().mockReturnValue('token-not-starting-with-user'),
        user: undefined,
    };

    await func(req, undefined, cb);

    expect(
        accountService.getAccountByPersonalAccessToken,
    ).not.toHaveBeenCalled();
    expect(cb).toHaveBeenCalled();
    expect(req.header).toHaveBeenCalled();
    expect(req.user).toBeFalsy();
});

test('should add user if known token', async () => {
    const apiUser = new User({
        id: 44,
        username: 'my-user',
    });
    const accountService = {
        getAccountByPersonalAccessToken: jest.fn().mockReturnValue(apiUser),
    };

    const func = patMiddleware(config, { accountService });

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

test('should call next if accountService throws exception', async () => {
    getLogger.setMuteError(true);
    const accountService = {
        getAccountByPersonalAccessToken: () => {
            throw new Error('Error occurred');
        },
    };

    const func = patMiddleware(config, { accountService });

    const cb = jest.fn();

    const req = {
        header: jest.fn().mockReturnValue('user:some-token'),
        user: undefined,
    };

    await func(req, undefined, cb);

    expect(cb).toHaveBeenCalled();
    getLogger.setMuteError(false);
});
