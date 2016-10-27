'use strict';

const request = require('./test-helper').request;

describe('The event api', () => {
    it('returns events', done => {
        request
            .get('/events')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('returns events given a name', done => {
        request
            .get('/events/myname')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });
});
