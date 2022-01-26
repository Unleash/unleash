import request from 'supertest';
import express from 'express';
import User from '../../types/user';
import PasswordProvider from './simple-password-provider';
import PasswordMismatchError from '../../error/password-mismatch';
import getLogger from '../../../test/fixtures/no-logger';

test('Should require password', async () => {
    const app = express();
    app.use(express.json());
    const userService = () => {};
    const ctr = new PasswordProvider({ getLogger }, { userService });

    //@ts-ignore
    app.use('/auth/simple', ctr.router);

    const res = await request(app)
        .post('/auth/simple/login')
        .send({ name: 'john' });

    expect(400).toBe(res.status);
});

test('Should login user', async () => {
    const username = 'ola';
    const password = 'simplepass';
    const user = new User({ id: 123, username });

    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
        //@ts-ignore
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
    const ctr = new PasswordProvider({ getLogger }, { userService });

    //@ts-ignore
    app.use('/auth/simple', ctr.router);

    const res = await request(app)
        .post('/auth/simple/login')
        .send({ username, password });

    expect(200).toBe(res.status);
    expect(user.username).toBe(res.body.username);
});

test('Should not login user with wrong password', async () => {
    const username = 'ola';
    const password = 'simplepass';
    const user = new User({ id: 133, username });

    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
        //@ts-ignore
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
    const ctr = new PasswordProvider({ getLogger }, { userService });

    //@ts-ignore
    app.use('/auth/simple', ctr.router);

    const res = await request(app)
        .post('/auth/simple/login')
        .send({ username, password: 'not-correct' });

    expect(res.status).toBe(401);
});
