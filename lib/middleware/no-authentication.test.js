'use strict';

const test = require('ava');
const supertest = require('supertest');
const express = require('express');
const noAuthentication = require('./no-authentication');

test('should add dummy user object to all requests', t => {
    t.plan(1);

    const app = express();
    noAuthentication('', app);
    app.get('/api/admin/test', (req, res) => {
        const user = Object.assign({}, req.user);

        return res
            .status(200)
            .json(user)
            .end();
    });
    const request = supertest(app);

    return request
        .get('/api/admin/test')
        .expect(200)
        .expect(res => {
            t.true(res.body.email === 'none@unknown.com');
        });
});
