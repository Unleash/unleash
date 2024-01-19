import getLogger from '../../test/fixtures/no-logger';
import patMiddleware from './pat-middleware';
import User from '../types/user';
import NotFoundError from '../error/notfound-error';
import { AccountService } from '../services/account-service';

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
    // @ts-expect-error wrong type
    const accountService = {
        getAccountByPersonalAccessToken: jest.fn(),
        addPATSeen: jest.fn(),
    } as AccountService;

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
    // @ts-expect-error wrong type
    const accountService = {
        getAccountByPersonalAccessToken: jest.fn(),
    } as AccountService;

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
    // @ts-expect-error wrong type
    const accountService = {
        getAccountByPersonalAccessToken: jest.fn().mockReturnValue(apiUser),
        addPATSeen: jest.fn(),
    } as AccountService;

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
    // @ts-expect-error wrong types
    const accountService = {
        getAccountByPersonalAccessToken: () => {
            throw new Error('Error occurred');
        },
    } as AccountService;

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

test('Should not log at error level if user not found', async () => {
    const fakeLogger = {
        debug: () => {},
        info: () => {},
        warn: jest.fn(),
        error: jest.fn(),
        fatal: console.error,
    };
    const conf = {
        getLogger: () => {
            return fakeLogger;
        },
        flagResolver: {
            isEnabled: jest.fn().mockReturnValue(true),
        },
    };
    // @ts-expect-error wrong type
    const accountService = {
        getAccountByPersonalAccessToken: jest.fn().mockImplementation(() => {
            throw new NotFoundError('Could not find pat');
        }),
    } as AccountService;
    const mw = patMiddleware(conf, { accountService });
    const cb = jest.fn();

    const req = {
        header: jest.fn().mockReturnValue('user:some-token'),
        user: undefined,
    };

    await mw(req, undefined, cb);
    expect(fakeLogger.error).not.toHaveBeenCalled();
    expect(fakeLogger.warn).toHaveBeenCalled();
});
