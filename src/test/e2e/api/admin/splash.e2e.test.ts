import type { Application, NextFunction, Request, Response } from 'express';
import {
    type IUnleashTest,
    setupAppWithCustomAuth,
} from '../../helpers/test-helper.js';
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import type { IUnleashConfig } from '../../../../lib/types/option.js';
import type { IUnleashServices } from '../../../../lib/services/index.js';
import type { IUnleashStores } from '../../../../lib/types/index.js';

let stores: IUnleashStores;
let db: ITestDb;
let app: IUnleashTest;

beforeAll(async () => {
    db = await dbInit('splash_api_serial', getLogger);
    stores = db.stores;

    const email = 'custom-user@mail.com';

    const preHook = (
        application: Application,
        _config: IUnleashConfig,
        { userService }: IUnleashServices,
    ) => {
        application.use(
            '/api/admin/',
            async (req: Request, _res: Response, next: NextFunction) => {
                // @ts-expect-error
                req.user = await userService.loginUserWithoutPassword(
                    email,
                    true,
                );
                next();
            },
        );
    };

    app = await setupAppWithCustomAuth(stores, preHook, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    });
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('it updates splash for user', async () => {
    expect.assertions(1);

    return app.request
        .post('/api/admin/splash/environment')
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.seen).toBe(true);
        });
});

test('it retrieves splash for user', async () => {
    expect.assertions(1);

    return app.request
        .get('/api/admin/user')
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.splash).toStrictEqual({ environment: true });
        });
});
