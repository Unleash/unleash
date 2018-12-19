'use strict';

const test = require('ava');
const store = require('../../test/fixtures/store');
const checkPermission = require('./permission-checker');
const supertest = require('supertest');
const getApp = require('../app');

const { EventEmitter } = require('events');
const eventBus = new EventEmitter();

function getSetup(preRouterHook) {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = store.createStores();
    const app = getApp({
        baseUriPath: base,
        stores,
        eventBus,
        preRouterHook(_app) {
            preRouterHook(_app);

            _app.get(
                `${base}/protectedResource`,
                checkPermission({ extendedPermissions: true }, 'READ'),
                (req, res) => {
                    res.status(200)
                        .json({ message: 'OK' })
                        .end();
                }
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
