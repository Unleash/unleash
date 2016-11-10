'use strict';

const clientMetricsStore = require('./mocks/fake-metrics-store');
const clientStrategyStore = require('./mocks/fake-client-strategy-store');
const clientInstanceStore = require('./mocks/fake-client-instance-store');

const supertest = require('supertest');
const assert = require('assert');
const sinon = require('sinon');

let request;

describe('Unit: The metrics api', () => {
    beforeEach(done => {
        const app = require('../../../app')({
            baseUriPath: '',
            stores: {
                db: sinon.stub(),
                eventStore: sinon.stub(),
                featureToggleStore: sinon.stub(),
                clientMetricsStore,
                strategyStore: sinon.stub(),
                clientStrategyStore,
                clientInstanceStore,
            },
        });

        request = supertest(app);
        done();
    });

    it('should register client', (done) => {
        request
            .post('/api/client/register')
            .send({ appName: 'demo', instanceId: 'test', strategies: ['default'], started: Date.now(), interval: 10 })
            .expect(200, done);
    });

    it('should require appName field', (done) => {
        request
            .post('/api/client/register')
            .expect(400, done)
    });
});
