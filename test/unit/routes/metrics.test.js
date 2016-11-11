'use strict';

const store = require('./mocks/store');
const supertest = require('supertest');
const assert = require('assert');

let request;

describe('Unit: The metrics api', () => {
    beforeEach(done => {
        const stores = store.createStores(); 
        const app = require('../../../app')({
            baseUriPath: '',
            stores: stores,
        });

        request = supertest(app);
        done();
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

    it('should require appName field', (done) => {
        request
            .post('/api/client/register')
            .expect(400, done)
    });

    it('should require strategies field', (done) => {
        request
            .post('/api/client/register')
            .send({ 
                appName: 'demo',
                instanceId: 'test',
                //strategies: ['default'],
                started: Date.now(),
                interval: 10 
            })
            .expect(400, done)
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
});
