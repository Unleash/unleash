'use strict';

const store = require('./mocks/store');


const supertest = require('supertest');
const assert = require('assert');
const sinon = require('sinon');

let request;
let db;

describe('Unit: The health cheack api', () => {
    beforeEach(done => {
        const stores = store.createStores();
        db = stores.db; 
        const app = require('../../../app')({
            baseUriPath: '',
            stores: stores,
        });
        request = supertest(app);
        done();
    });

    it('should give 500 when db is failing', (done) => {
        db.select = () => {
            return {
                from: () => Promise.reject(new Error('db error'))
            }
        }

        request
            .get('/health')
            .expect(500)
            .end((err, res) => {
                assert.equal(res.status, 500)
                assert.equal(res.body.health, 'BAD');
                done();
            });
    });

    it('should give 200 when db is not failing', (done) => {
        request
            .get('/health')
            .expect(200, done)
    });

    it('should give health=GOOD when db is not failing', (done) => {
        request
            .get('/health')
            .expect(200)
            .end((err, res) => {
                assert.equal(res.status, 200)
                assert.equal(res.body.health, 'GOOD');
                done();
            });
    });
});
