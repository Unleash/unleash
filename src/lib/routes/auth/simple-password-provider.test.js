const test = require('ava');
const request = require('supertest');
const express = require('express');
const User = require('../../types/user');
const PasswordProvider = require('./simple-password-provider');

const getLogger = () => ({ info: () => {}, error: () => {} });

test('Should require password', async t => {
    const app = express();
    app.use(express.json());
    const userService = () => {};
    const ctr = new PasswordProvider({ getLogger }, { userService });

    app.use('/auth/simple', ctr.router);

    const res = await request(app)
        .post('/auth/simple/login')
        .send({ name: 'john' });

    t.is(400, res.status);
});

test('Should login user', async t => {
    const username = 'ola';
    const password = 'simplepass';
    const user = new User({ id: 123, username });

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

    t.is(200, res.status);
    t.is(user.username, res.body.username);
});

test('Should not login user with wrong password', async t => {
    const username = 'ola';
    const password = 'simplepass';
    const user = new User({ id: 133, username });

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

    t.is(401, res.status);
});
