const request = require('supertest');
const express = require('express');
const User = require('../../user');
const PasswordProvider = require('./simple-password-provider');

const getLogger = () => ({ info: () => {}, error: () => {} });

test('Should require password', async () => {
    const app = express();
    app.use(express.json());
    const userService = () => {};
    const ctr = new PasswordProvider({ getLogger }, { userService });

    app.use('/auth/simple', ctr.router);

    const res = await request(app)
        .post('/auth/simple/login')
        .send({ name: 'john' });

    expect(400).toBe(res.status);
});

test('Should login user', async () => {
    const username = 'ola';
    const password = 'simplepass';
    const user = new User({ username, permissions: ['ADMIN'] });

    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
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
    const user = new User({ username, permissions: ['ADMIN'] });

    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
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

    app.use('/auth/simple', ctr.router);

    const res = await request(app)
        .post('/auth/simple/login')
        .send({ username, password: 'not-correct' });

    expect(401).toBe(res.status);
});
