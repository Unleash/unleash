'use strict';

const test = require('ava');
const supertest = require('supertest');
const sinon = require('sinon');
const { EventEmitter } = require('events');
const store = require('../../test/fixtures/store');
const checkPermission = require('./permission-checker');
const getApp = require('../app');
const getLogger = require('../../test/fixtures/no-logger');
const { CREATE_PROJECT } = require('../permissions');

const eventBus = new EventEmitter();

function getSetup(preRouterHook) {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = store.createStores();
    const app = getApp({
        baseUriPath: base,
        stores,
        eventBus,
        getLogger,
        preRouterHook(_app) {
            preRouterHook(_app);

            _app.get(
                `${base}/protectedResource`,
                checkPermission({ extendedPermissions: true }, 'READ'),
                (req, res) => {
                    res.status(200)
                        .json({ message: 'OK' })
                        .end();
                },
            );
        },
    });

    return {
        base,
        request: supertest(app),
    };
}

test('should return 403 when missing permission', t => {
    t.plan(0);
    const { base, request } = getSetup(() => {});

    return request.get(`${base}/protectedResource`).expect(403);
});

test('should allow access with correct permissions', t => {
    const { base, request } = getSetup(app => {
        app.use((req, res, next) => {
            req.user = { email: 'some@email.com', permissions: ['READ'] };
            next();
        });
    });

    return request
        .get(`${base}/protectedResource`)
        .expect(200)
        .expect(res => {
            t.is(res.body.message, 'OK');
        });
});

test('should allow access with admin permissions', t => {
    const { base, request } = getSetup(app => {
        app.use((req, res, next) => {
            req.user = { email: 'some@email.com', permissions: ['ADMIN'] };
            next();
        });
    });

    return request
        .get(`${base}/protectedResource`)
        .expect(200)
        .expect(res => {
            t.is(res.body.message, 'OK');
        });
});

test('should call checkPermission if defined', async t => {
    const config = {
        experimental: {
            rbac: true,
        },
    };

    const func = checkPermission(config, CREATE_PROJECT);

    const cb = sinon.fake();
    const req = {
        checkRbac: sinon.fake.returns(Promise.resolve(true)),
    };

    func(req, undefined, cb);

    t.true(req.checkRbac.calledOnce);
    t.is(req.checkRbac.firstArg, CREATE_PROJECT);
});

test('should call checkPermission if defined and give 403 response', async t => {
    const config = {
        experimental: {
            rbac: true,
        },
    };

    const func = checkPermission(config, CREATE_PROJECT);

    const cb = sinon.fake();
    const req = {
        checkRbac: sinon.fake.returns(Promise.resolve(false)),
    };

    const fakeJson = sinon.fake.returns({
        end: sinon.fake(),
    });

    const fakeStatus = sinon.fake.returns({
        json: fakeJson,
    });

    const res = {
        status: fakeStatus,
    };

    await func(req, res, cb);

    t.true(req.checkRbac.calledOnce);
    t.is(req.checkRbac.firstArg, CREATE_PROJECT);
    t.false(cb.called);
    t.is(fakeStatus.firstArg, 403);
});
