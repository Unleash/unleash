import sinon from 'sinon';

import apiTokenMiddleware from './api-token-middleware';
import getLogger from '../../test/fixtures/no-logger';
import User from '../user';
import { CLIENT } from '../permissions';
import { createTestConfig } from '../../test/config/test-config';

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
        getUserForToken: sinon.fake(),
    };

    const func = apiTokenMiddleware(config, { apiTokenService });

    const cb = sinon.fake();

    const req = {
        header: sinon.fake(),
    };

    await func(req, undefined, cb);

    expect(req.header.calledOnce).toBe(true);
    expect(cb.calledOnce).toBe(true);
});

test('should not add user if unknown token', async () => {
    const apiTokenService = {
        getUserForToken: sinon.fake(),
    };

    const func = apiTokenMiddleware(config, { apiTokenService });

    const cb = sinon.fake();

    const req = {
        header: sinon.fake.returns('some-token'),
        user: undefined,
    };

    await func(req, undefined, cb);

    expect(cb.called).toBe(true);
    expect(req.header.called).toBe(true);
    expect(req.user).toBeFalsy();
});

test('should add user if unknown token', async () => {
    const apiUser = new User({
        isAPI: true,
        username: 'default',
        permissions: [CLIENT],
    });
    const apiTokenService = {
        getUserForToken: sinon.fake.returns(apiUser),
    };

    const func = apiTokenMiddleware(config, { apiTokenService });

    const cb = sinon.fake();

    const req = {
        header: sinon.fake.returns('some-known-token'),
        user: undefined,
    };

    await func(req, undefined, cb);

    expect(cb.called).toBe(true);
    expect(req.header.called).toBe(true);
    expect(req.user).toBe(apiUser);
});

test('should not add user if disabled', async () => {
    const apiUser = new User({
        isAPI: true,
        username: 'default',
        permissions: [CLIENT],
    });
    const apiTokenService = {
        getUserForToken: sinon.fake.returns(apiUser),
    };

    const disabledConfig = createTestConfig({
        getLogger,
        authentication: {
            enableApiToken: false,
            createAdminUser: false,
        },
    });

    const func = apiTokenMiddleware(disabledConfig, { apiTokenService });

    const cb = sinon.fake();

    const req = {
        header: sinon.fake.returns('some-known-token'),
        user: undefined,
    };

    await func(req, undefined, cb);

    expect(cb.called).toBe(true);
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

    const cb = sinon.fake();

    const req = {
        header: sinon.fake.returns('some-token'),
        user: undefined,
    };

    await func(req, undefined, cb);

    expect(cb.called).toBe(true);
    getLogger.setMuteError(false);
});

test('should call next if apiTokenService throws x2', async () => {
    const apiTokenService = {
        getUserForToken: () => {
            throw new Error('hi there, i am stupid');
        },
    };

    const func = apiTokenMiddleware(config, { apiTokenService });

    const cb = sinon.fake();

    const req = {
        header: sinon.fake.returns('some-token'),
        user: undefined,
    };

    await func(req, undefined, cb);

    expect(cb.called).toBe(true);
});
