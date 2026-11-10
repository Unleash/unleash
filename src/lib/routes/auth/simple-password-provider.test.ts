import request from 'supertest';
import express from 'express';
import User from '../../types/user.js';
import { SimplePasswordProvider } from './simple-password-provider.js';
import PasswordMismatchError from '../../error/password-mismatch.js';
import { createTestConfig } from '../../../test/config/test-config.js';
import { OpenApiService } from '../../services/openapi-service.js';

const sessionStub = () => {
    let request: { session?: unknown } | undefined;

    const middleware: express.RequestHandler = (req, _res, next) => {
        request = req as { session?: unknown };
        const fresh = (): unknown => ({
            regenerate(callback: (err?: unknown) => void) {
                request!.session = fresh();
                callback();
            },
            save(callback: (err?: unknown) => void) {
                callback();
            },
        });
        request.session = fresh();
        next();
    };

    return { middleware, session: () => request?.session };
};

test('Should require password', async () => {
    const config = createTestConfig();
    const openApiService = new OpenApiService(config);
    const app = express();
    app.use(express.json());
    const userService = () => {};

    const ctr = new SimplePasswordProvider(config, {
        // @ts-expect-error
        userService,
        openApiService,
    });

    app.use('/auth/simple', ctr.router);

    const res = await request(app)
        .post('/auth/simple/login')
        .send({ name: 'john' });

    expect(400).toBe(res.status);
});

test('Should login user', async () => {
    const config = createTestConfig();
    const openApiService = new OpenApiService(config);
    const username = 'ola';
    const password = 'simplepass';
    const user = new User({ id: 123, username });

    const app = express();
    app.use(express.json());
    const sessions = sessionStub();
    app.use(sessions.middleware);

    const userService = {
        loginUser: (u, p) => {
            if (u === username && p === password) {
                return user;
            }
            throw new Error('Wrong password');
        },
    };

    const ctr = new SimplePasswordProvider(config, {
        // @ts-expect-error -- focused test double implements only the method used here
        userService,
        openApiService,
    });

    app.use('/auth/simple', ctr.router);

    const res = await request(app)
        .post('/auth/simple/login')
        .send({ username, password });

    expect(200).toBe(res.status);
    expect(user.username).toBe(res.body.username);

    // the login went through `startSession`, so the session it left behind
    // carries the user and a login time the timeout middleware can read
    const session = sessions.session() as {
        user?: { username?: string };
        authenticatedAt?: string;
        lastInteractionAt?: string;
    };
    expect(session.user?.username).toBe(username);
    expect(Date.parse(session.authenticatedAt!)).toBeGreaterThan(0);
    expect(session.lastInteractionAt).toEqual(session.authenticatedAt);
});

test('Should not login user with wrong password', async () => {
    const config = createTestConfig();
    const openApiService = new OpenApiService(config);
    const username = 'ola';
    const password = 'simplepass';
    const user = new User({ id: 133, username });

    const app = express();
    app.use(express.json());
    const sessions = sessionStub();
    app.use(sessions.middleware);

    const userService = {
        loginUser: (u, p) => {
            if (u === username && p === password) {
                return user;
            }
            throw new PasswordMismatchError();
        },
    };

    const ctr = new SimplePasswordProvider(config, {
        // @ts-expect-error -- focused test double implements only the method used here
        userService,
        openApiService,
    });

    app.use('/auth/simple', ctr.router);

    const res = await request(app)
        .post('/auth/simple/login')
        .send({ username, password: 'not-correct' });

    expect(res.status).toBe(401);
});
