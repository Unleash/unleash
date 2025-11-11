import request from 'supertest';
import express from 'express';
import { vi } from 'vitest';
import User from '../../types/user.js';
import { SimplePasswordProvider } from './simple-password-provider.js';
import PasswordMismatchError from '../../error/password-mismatch.js';
import { createTestConfig } from '../../../test/config/test-config.js';
import { OpenApiService } from '../../services/openapi-service.js';

test('Should require password', async () => {
    const config = createTestConfig();
    const openApiService = new OpenApiService(config);
    const app = express();
    app.use(express.json());
    const router = express.Router();
    // Stub userService with a loginUser function so handler won't throw TypeErrors
    const loginUser = vi.fn();
    const userService = { loginUser };

    const ctr = new SimplePasswordProvider(config, {
        // @ts-expect-error
        userService,
        openApiService,
    });

    router.use('/auth/simple', ctr.router);
    // Install OpenAPI request validator (normally done in app.ts)
    await openApiService.initializeOpenApi(app, router);
    app.use(router);

    const res = await request(app)
        .post('/auth/simple/login')
        .send({ name: 'john' }); // missing required username/password keys

    expect(res.status).toBe(400);
    expect(loginUser).not.toHaveBeenCalled();
});

test('Should login user', async () => {
    const config = createTestConfig();
    const openApiService = new OpenApiService(config);
    const username = 'ola';
    const password = 'simplepass';
    const user = new User({ id: 123, username });

    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
        // @ts-expect-error
        req.session = {};
        next();
    });

    const userService = {
        loginUser: (u, p) => {
            if (u === username && p === password) {
                return user;
            }
            throw new Error('Wrong password');
        },
    };

    const ctr = new SimplePasswordProvider(config, {
        // @ts-expect-error
        userService,
        openApiService,
    });

    app.use('/auth/simple', ctr.router);

    const res = await request(app)
        .post('/auth/simple/login')
        .send({ username, password });

    expect(200).toBe(res.status);
    expect(user.username).toBe(res.body.username);
});

test('Should not login user with wrong password', async () => {
    const config = createTestConfig();
    const openApiService = new OpenApiService(config);
    const username = 'ola';
    const password = 'simplepass';
    const user = new User({ id: 133, username });

    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
        // @ts-expect-error
        req.session = {};
        next();
    });

    const userService = {
        loginUser: (u, p) => {
            if (u === username && p === password) {
                return user;
            }
            throw new PasswordMismatchError();
        },
    };

    const ctr = new SimplePasswordProvider(config, {
        // @ts-expect-error
        userService,
        openApiService,
    });

    app.use('/auth/simple', ctr.router);

    const res = await request(app)
        .post('/auth/simple/login')
        .send({ username, password: 'not-correct' });

    expect(res.status).toBe(401);
});
