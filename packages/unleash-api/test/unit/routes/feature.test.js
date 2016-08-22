'use strict';

let supertest = require('supertest');
const BPromise = require('bluebird');
BPromise.promisifyAll(supertest);
const assert = require('assert');
const sinon = require('sinon');

let request;
let featureDb;

describe('Unit: The features api', () => {
    beforeEach(done => {
        featureDb = createFeatureDb();

        const app = require('../../../app')({
            baseUriPath: '',
            db: sinon.stub(),
            eventDb: sinon.stub(),
            eventStore: sinon.stub(),
            featureDb: featureDb,
            strategyDb: sinon.stub(),
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
        featureDb.addFeature( { name: 'test', strategies: [{ name: 'default' }] } );

        request
            .get('/features')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                assert(res.body.features.length === 1);
                done();
            });
    });
});

function createFeatureDb () {
    let _features = [];
    return {
        getFeatures: () => BPromise.resolve(_features),
        addFeature: (feature) => _features.push(feature),
    };
}
