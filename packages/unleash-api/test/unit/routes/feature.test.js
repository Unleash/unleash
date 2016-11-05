'use strict';

const clientMetricsStore = require('./mocks/fake-metrics-store');
const featureToggleStore = require('./mocks/fake-feature-toggle-store');
const strategyStore = require('./mocks/fake-strategies-store');

const supertest = require('supertest');
const assert = require('assert');
const sinon = require('sinon');

let request;

describe('Unit: The features api', () => {
    beforeEach(done => {
        featureToggleStore.reset();

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

    it('should get empty getFeatures', (done) => {
        request
            .get('/features')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                assert(res.body.features.length === 0);
                done();
            });
    });

    it('should get one getFeature', (done) => {
        featureToggleStore.addFeature( { name: 'test', strategies: [{ name: 'default' }] } );

        request
            .get('/features')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                assert(res.body.features.length === 1);
                done();
            });
    });

    it('should add version numbers for /features', (done) => {
        featureToggleStore.addFeature( { name: 'test', strategies: [{ name: 'default' }] } );

        request
            .get('/features')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                assert.equal(res.body.version, 1);
                done();
            });
    });
});
