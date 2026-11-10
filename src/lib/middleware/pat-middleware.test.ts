import getLogger from '../../test/fixtures/no-logger.js';
import patMiddleware from './pat-middleware.js';
import User from '../types/user.js';
import NotFoundError from '../error/notfound-error.js';
import type { AccountService } from '../services/account-service.js';

import { vi } from 'vitest';

let config: any;

beforeEach(() => {
    config = {
        getLogger,
        flagResolver: {
            isEnabled: vi.fn().mockReturnValue(true),
        },
    };
});

test('should not inspect PAT credentials after another middleware authenticates the request', async () => {
    const accountService = {
        authenticateAccountByToken: vi.fn(),
    } as unknown as AccountService;
    const func = patMiddleware(config, { accountService });
    const cb = vi.fn();
    const req = {
        header: vi.fn(),
        user: new User({ id: 44, username: 'already-authenticated' }),
    };

    await func(req, undefined, cb);

    expect(req.header).not.toHaveBeenCalled();
    expect(accountService.authenticateAccountByToken).not.toHaveBeenCalled();
    expect(cb).toHaveBeenCalledOnce();
});

test('should not set user if unknown token', async () => {
    // @ts-expect-error wrong type
    const accountService = {
        authenticateAccountByToken: vi.fn(),
    } as AccountService;

    const func = patMiddleware(config, { accountService });

    const cb = vi.fn();

    const req = {
        header: vi.fn().mockReturnValue('user:some-token'),
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
        authenticateAccountByToken: vi.fn(),
    } as AccountService;

    const func = patMiddleware(config, { accountService });

    const cb = vi.fn();

    const req = {
        header: vi.fn().mockReturnValue('token-not-starting-with-user'),
        user: undefined,
    };

    await func(req, undefined, cb);

    expect(accountService.authenticateAccountByToken).not.toHaveBeenCalled();
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
        authenticateAccountByToken: vi.fn().mockReturnValue(apiUser),
    } as AccountService;

    const func = patMiddleware(config, { accountService });

    const cb = vi.fn();

    const req = {
        header: vi.fn().mockReturnValue('user:some-known-token'),
        user: undefined,
        path: '/api/client',
    };

    await func(req, undefined, cb);

    expect(cb).toHaveBeenCalled();
    expect(req.header).toHaveBeenCalled();
    expect(req.user).toBe(apiUser);
    expect(accountService.authenticateAccountByToken).toHaveBeenCalledWith({
        kind: 'account-access',
        version: 'v1',
        secret: 'user:some-known-token',
    });
});

test('should pass a secure token to the authentication boundary', async () => {
    const accountService = {
        authenticateAccountByToken: vi
            .fn()
            .mockReturnValue(new User({ id: 44, username: 'my-user' })),
    } as unknown as AccountService;
    const func = patMiddleware(config, { accountService });
    const selector = 'a'.repeat(22);
    const secret = `user:v2_${selector}_${'b'.repeat(43)}`;

    await func(
        { header: vi.fn().mockReturnValue(secret), user: undefined },
        undefined,
        vi.fn(),
    );

    expect(accountService.authenticateAccountByToken).toHaveBeenCalledWith({
        kind: 'account-access',
        version: 'v2',
        secret,
        selector,
    });
});

test('should call next if accountService throws exception', async () => {
    getLogger.setMuteError(true);
    // @ts-expect-error wrong types
    const accountService = {
        authenticateAccountByToken: () => {
            throw new Error('Error occurred');
        },
    } as AccountService;

    const func = patMiddleware(config, { accountService });

    const cb = vi.fn();

    const req = {
        header: vi.fn().mockReturnValue('user:some-token'),
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
        warn: vi.fn(),
        error: vi.fn(),
        fatal: console.error,
    };
    const conf = {
        getLogger: () => {
            return fakeLogger;
        },
        flagResolver: {
            isEnabled: vi.fn().mockReturnValue(true),
        },
    };
    // @ts-expect-error wrong type
    const accountService = {
        authenticateAccountByToken: vi.fn().mockImplementation(() => {
            throw new NotFoundError('Could not find pat');
        }),
    } as AccountService;
    const mw = patMiddleware(conf, { accountService });
    const cb = vi.fn();

    const req = {
        header: vi.fn().mockReturnValue('user:some-token'),
        user: undefined,
    };

    await mw(req, undefined, cb);
    expect(fakeLogger.error).not.toHaveBeenCalled();
    expect(fakeLogger.warn).toHaveBeenCalled();
});
