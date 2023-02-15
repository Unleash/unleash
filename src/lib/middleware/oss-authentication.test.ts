import supertest from 'supertest';
import { createServices } from '../services';
import { createTestConfig } from '../../test/config/test-config';

import createStores from '../../test/fixtures/store';
import ossAuth from './oss-authentication';
import getApp from '../app';
import User from '../types/user';
import sessionDb from './session-db';

async function getSetup(preRouterHook) {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const config = createTestConfig({
        server: { baseUriPath: base },
        preRouterHook: (_app) => {
            preRouterHook(_app);
            ossAuth(_app, base);
            _app.get(`${base}/api/protectedResource`, (req, res) => {
                res.status(200).json({ message: 'OK' }).end();
            });
        },
    });
    const stores = createStores();
    const services = createServices(stores, config);
    const unleashSession = sessionDb(config, undefined);
    const app = await getApp(config, stores, services, unleashSession);

    return {
        base,
        request: supertest(app),
    };
}

test('should return 401 when missing user', async () => {
    expect.assertions(0);
    const { base, request } = await getSetup(() => {});

    return request.get(`${base}/api/protectedResource`).expect(401);
});

test('should return 200 when user exists', async () => {
    expect.assertions(0);
    const user = new User({ id: 1, email: 'some@mail.com' });
    const { base, request } = await getSetup((app) =>
        app.use((req, res, next) => {
            req.user = user;
            next();
        }),
    );

    return request.get(`${base}/api/protectedResource`).expect(200);
});
