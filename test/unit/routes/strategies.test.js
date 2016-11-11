'use strict';

const store = require('./mocks/store');


const supertest = require('supertest');
const assert = require('assert');
const sinon = require('sinon');

let request;
let strategyStore;

describe('Unit: The strategies api', () => {
    beforeEach(done => {
       const stores = store.createStores(); 
        const app = require('../../../app')({
            baseUriPath: '',
            stores: stores,
        });
        strategyStore = stores.strategyStore;
        request = supertest(app);
        done();
    });

    it('should add version numbers for /stategies', (done) => {
        request
            .get('/api/strategies')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                assert.equal(res.body.version, 1);
                done();
            });
    });
});
