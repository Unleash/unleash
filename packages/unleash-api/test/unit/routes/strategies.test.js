'use strict';

const supertest = require('supertest');
const BPromise = require('bluebird');
BPromise.promisifyAll(supertest);
const assert = require('assert');
const sinon = require('sinon');

let request;
let stratDb;

describe('Unit: The strategies api', () => {
    beforeEach(done => {
        stratDb = createStrategyDb();

        const app = require('../../../app')({
            baseUriPath: '',
            db: sinon.stub(),
            eventDb: sinon.stub(),
            eventStore: sinon.stub(),
            featureDb: sinon.stub(),
            strategyDb: stratDb,
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

function createStrategyDb () {
    const _strategies = [{ name: 'default', parameters: {} }];
    return {
        getStrategies: () => BPromise.resolve(_strategies),
        addStrategy: (strat) => _strategies.push(strat),
    };
}
