'use strict';

const store = require('./mocks/store');

const supertest = require('supertest');
const assert = require('assert');


let request;
let featureToggleStore;

describe('Unit: The features api', () => {
    beforeEach(done => {
        const stores = store.createStores(); 
        const app = require('../../../app')({
            baseUriPath: '',
            stores: stores,
        });

        featureToggleStore = stores.featureToggleStore;
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
