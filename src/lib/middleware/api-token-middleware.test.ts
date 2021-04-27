import test from 'ava';

import sinon from 'sinon';

import apiTokenMiddleware from './api-token-middleware';
import getLogger from '../../test/fixtures/no-logger';
import { CLIENT } from '../permissions';
import { createTestConfig } from '../../test/config/test-config';
import ApiUser from '../types/api-user';

let config: any;

test.beforeEach(() => {
    config = {
        getLogger,
        authentication: {
            enableApiToken: true,
        },
    };
});

test('should not do anything if request does not contain a authorization', async t => {
    const apiTokenService = {
        getUserForToken: sinon.fake(),
    };

    const func = apiTokenMiddleware(config, { apiTokenService });

    const cb = sinon.fake();

    const req = {
        header: sinon.fake(),
    };

    await func(req, undefined, cb);

    t.true(req.header.calledOnce);
    t.true(cb.calledOnce);
});

test('should not add user if unknown token', async t => {
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

    t.true(cb.called);
    t.true(req.header.called);
    t.falsy(req.user);
});

test('should add user if unknown token', async t => {
    const apiUser = new ApiUser({
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

    t.true(cb.called);
    t.true(req.header.called);
    t.is(req.user, apiUser);
});

test('should not add user if disabled', async t => {
    const apiUser = new ApiUser({
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

    t.true(cb.called);
    t.falsy(req.user);
});

test('should call next if apiTokenService throws', async t => {
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

    t.true(cb.called);
    getLogger.setMuteError(false);
});

test('should call next if apiTokenService throws x2', async t => {
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

    t.true(cb.called);
});
