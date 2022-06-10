import { Application, NextFunction, Request, Response } from 'express';
import { setupAppWithCustomAuth } from '../../helpers/test-helper';
import dbInit from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { IUnleashConfig } from '../../../../lib/types/option';
import { IUnleashServices } from '../../../../lib/types/services';

let stores;
let db;
let app;

beforeAll(async () => {
    db = await dbInit('feedback_api_serial', getLogger);
    stores = db.stores;

    const email = 'custom-user@mail.com';

    const preHook = (
        application: Application,
        config: IUnleashConfig,
        { userService }: IUnleashServices,
    ) => {
        application.use(
            '/api/admin/',
            async (req: Request, res: Response, next: NextFunction) => {
                // @ts-ignore
                req.user = await userService.loginUserWithoutPassword(
                    email,
                    true,
                );
                next();
            },
        );
    };

    app = await setupAppWithCustomAuth(stores, preHook);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('it creates feedback for user', async () => {
    expect.assertions(1);

    return app.request
        .post('/api/admin/feedback')
        .send({ feedbackId: 'pnps' })
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.feedbackId).toBe('pnps');
        });
});

test('it gives 400 when feedback is not present', async () => {
    expect.assertions(1);

    return app.request
        .post('/api/admin/feedback')
        .send({})
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .expect((res) => {
            expect(res.body.name).toEqual('BadDataError');
        });
});

test('it updates feedback for user', async () => {
    expect.assertions(1);

    return app.request
        .put('/api/admin/feedback/pnps')
        .send({ neverShow: true })
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.neverShow).toBe(true);
        });
});

test('it retrieves feedback for user', async () => {
    expect.assertions(2);

    return app.request
        .get('/api/admin/user')
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.feedback.length).toBe(1);
            expect(res.body.feedback[0].feedbackId).toBe('pnps');
        });
});
