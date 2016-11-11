'use strict';

const specHelper = require('./util/test-helper');
const assert     = require('assert');
let request;

describe('The metrics api', () => {
    beforeEach(done => {
        specHelper.setupApp().then((app) => {
            request = app.request;
            done();
        });
    });

    it('should register client', (done) => {
        request
            .post('/api/client/register')
            .send({ 
                appName: 'demo',
                instanceId: 'test',
                strategies: ['default'],
                started: Date.now(),
                interval: 10 
            })
            .expect(202, done);
    });

    it('should accept client metrics', (done) => {
        request
            .post('/api/client/metrics')
            .send({ 
                appName: 'demo',
                instanceId: '1',
                bucket: {
                    start: Date.now(),
                    stop: Date.now(),
                    toggles: {}
                }
            })
            .expect(202, done)
    });

    it('should get client strategies', done => {
        request
            .get('/api/client/strategies')
            .expect('Content-Type', /json/)
            .end((err, res) => {
                assert(res.status, 200);
                assert(res.body.length === 1, `expected 1 registerd client, got ${res.body}`);
                done();
            });;
    });

    it('should get client instances', done => {
        request
            .get('/api/client/instances')
            .expect('Content-Type', /json/)
            .end((err, res) => {
                assert(res.status, 200);
                assert(res.body.length === 1, `expected 1 registerd client, got ${res.body}`);
                done();
            });;
    });
});
