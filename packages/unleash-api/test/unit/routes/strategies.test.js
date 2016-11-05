'use strict';

const clientMetricsStore = require('./mocks/fake-metrics-store');
const featureToggleStore = require('./mocks/fake-feature-toggle-store');
const strategyStore = require('./mocks/fake-strategies-store');

const supertest = require('supertest');
const assert = require('assert');
const sinon = require('sinon');

let request;

describe('Unit: The strategies api', () => {
    beforeEach(done => {
        strategyStore.reset();

        const app = require('../../../app')({
            baseUriPath: '',
            stores: {
                db: sinon.stub(),
                eventStore: sinon.stub(),
                featureToggleStore,
                clientMetricsStore,
                strategyStore,
                clientStrategyStore: sinon.stub(),
                clientInstanceStore: sinon.stub(),
            },
        });

        request = supertest(app);
        done();
    });

    it('should add version numbers for /stategies', (done) => {
        request
            .get('/strategies')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                assert.equal(res.body.version, 1);
                done();
            });
    });
});
