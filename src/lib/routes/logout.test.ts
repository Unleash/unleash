import supertest from 'supertest';
import express from 'express';
import { createTestConfig } from '../../test/config/test-config';

import LogoutController from './logout';
import { IAuthRequest } from './unleash-types';

test('should redirect to "/" after logout', async () => {
    const baseUriPath = '';
    const app = express();
    const config = createTestConfig({ server: { baseUriPath } });
    app.use('/logout', new LogoutController(config).router);
    const request = supertest(app);
    expect.assertions(0);
    await request
        .get(`${baseUriPath}/logout`)
        .expect(302)
        .expect('Location', `${baseUriPath}/`);
});

test('should redirect to "/basePath" after logout when baseUriPath is set', async () => {
    const baseUriPath = '/basePath';
    const app = express();
    const config = createTestConfig({ server: { baseUriPath } });
    app.use('/logout', new LogoutController(config).router);
    const request = supertest(app);
    expect.assertions(0);
    await request
        .get('/logout')
        .expect(302)
        .expect('Location', `${baseUriPath}/`);
});

test('should set "Clear-Site-Data" header', async () => {
    const baseUriPath = '';
    const app = express();
    const config = createTestConfig({ server: { baseUriPath } });
    app.use('/logout', new LogoutController(config).router);
    const request = supertest(app);
    expect.assertions(0);
    await request
        .get(`${baseUriPath}/logout`)
        .expect(302)
        .expect('Clear-Site-Data', '"cookies", "storage"');
});

test('should not set "Clear-Site-Data" header', async () => {
    const baseUriPath = '';
    const app = express();
    const config = createTestConfig({
        server: { baseUriPath },
        session: { clearSiteDataOnLogout: false },
    });
    app.use('/logout', new LogoutController(config).router);
    const request = supertest(app);
    expect.assertions(1);
    await request
        .get(`${baseUriPath}/logout`)
        .expect(302)
        .expect((res) =>
            expect(res.headers['Clear-Site-Data']).toBeUndefined(),
        );
});

test('should clear "unleash-session" cookies', async () => {
    const baseUriPath = '';
    const app = express();
    const config = createTestConfig({ server: { baseUriPath } });
    app.use('/logout', new LogoutController(config).router);
    const request = supertest(app);
    expect.assertions(0);
    await request
        .get(`${baseUriPath}/logout`)
        .expect(302)
        .expect(
            'Set-Cookie',
            'unleash-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        );
});

test('should clear "unleash-session" cookie even when disabled clear site data', async () => {
    const baseUriPath = '';
    const app = express();
    const config = createTestConfig({
        server: { baseUriPath },
        session: { clearSiteDataOnLogout: false },
    });
    app.use('/logout', new LogoutController(config).router);
    const request = supertest(app);
    expect.assertions(0);
    await request
        .get(`${baseUriPath}/logout`)
        .expect(302)
        .expect(
            'Set-Cookie',
            'unleash-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        );
});

test('should call destroy on session', async () => {
    const baseUriPath = '';
    const fakeSession = {
        destroy: jest.fn(),
    };
    const app = express();
    const config = createTestConfig({ server: { baseUriPath } });
    app.use((req: IAuthRequest, res, next) => {
        req.session = fakeSession;
        next();
    });
    app.use('/logout', new LogoutController(config).router);
    const request = supertest(app);
    await request.get(`${baseUriPath}/logout`);

    expect(fakeSession.destroy.mock.calls.length).toBe(1);
});

test('should redirect to alternative logoutUrl', async () => {
    const fakeSession = {
        destroy: jest.fn(),
        logoutUrl: '/some-other-path',
    };
    const app = express();
    const config = createTestConfig();
    app.use((req: IAuthRequest, res, next) => {
        req.session = fakeSession;
        next();
    });
    app.use('/logout', new LogoutController(config).router);
    const request = supertest(app);
    await request
        .get('/logout')
        .expect(302)
        .expect('Location', '/some-other-path');
});
