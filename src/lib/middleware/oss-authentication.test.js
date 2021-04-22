'use strict';

import { createServices } from '../services';
import { createTestConfig } from '../../test/config/test-config';

const test = require('ava');
const supertest = require('supertest');
const { EventEmitter } = require('events');
const store = require('../../test/fixtures/store');
const ossAuth = require('./oss-authentication');
const getApp = require('../app');
const { User } = require('../server-impl');

const eventBus = new EventEmitter();

function getSetup(preRouterHook) {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const config = createTestConfig({
        server: { baseUriPath: base },
        preRouterHook: _app => {
            preRouterHook(_app);
            ossAuth(_app, { server: { baseUriPath: base } });
            _app.get(`${base}/api/protectedResource`, (req, res) => {
                res.status(200)
                    .json({ message: 'OK' })
                    .end();
            });
        },
    });
    const stores = store.createStores();
    const services = createServices(stores, config);
    const app = getApp(config, stores, services, eventBus);

    return {
        base,
        request: supertest(app),
    };
}

test('should return 401 when missing user', t => {
    t.plan(0);
    const { base, request } = getSetup(() => {});

    return request.get(`${base}/api/protectedResource`).expect(401);
});

test('should return 200 when user exists', t => {
    t.plan(0);
    const user = new User({ id: 1, email: 'some@mail.com' });
    const { base, request } = getSetup(app =>
        app.use((req, res, next) => {
            req.user = user;
            next();
        }),
    );

    return request.get(`${base}/api/protectedResource`).expect(200);
});
