'use strict';

const specHelper = require('./test-helper');
const request = specHelper.request;

describe('The routes', () => {
    describe('healthcheck', () => {
        it('returns health good', done => {
            request.get('/health')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect('{"health":"GOOD"}', done);
        });
    });
});
