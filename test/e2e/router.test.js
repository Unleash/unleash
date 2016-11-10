'use strict';

const specHelper = require('./util/test-helper');

let request;

describe('The routes', () => {
    beforeEach(done => {
        specHelper.setupApp().then((app) => {
            request = app.request;
            done();
        });
    });

    describe('healthcheck', () => {
        it('returns health good', done => {
            request.get('/health')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect('{"health":"GOOD"}', done);
        });
    });
});
