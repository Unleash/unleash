'use strict';

const specHelper = require('./util/test-helper');
let request;

describe('The event api', () => {
    beforeEach(done => {
        specHelper.setupApp().then((app) => {
            request = app.request;
            done();
        });
    });

    it('returns events', done => {
        request
            .get('/api/events')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('returns events given a name', done => {
        request
            .get('/api/events/myname')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });
});
