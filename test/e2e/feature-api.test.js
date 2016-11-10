'use strict';

const logger = require('../../lib/logger');
const assert     = require('assert');
const specHelper = require('./util/test-helper');
const stringify  = function (o) {
    return JSON.stringify(o, null, ' ');
};

let request;

describe('The features api', () => {
    beforeEach(done => {
        specHelper.setupApp().then((app) => {
            request = app.request;
            done();
        });
    });

    it('returns three feature toggles', done => {
        request
            .get('/features')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                assert(res.body.features.length === 3, `expected 3 features, got ${stringify(res.body)}`);
                done();
            });
    });

    it('gets a feature by name', done => {
        request
            .get('/features/featureX')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('cant get feature that dose not exist', done => {
        logger.setLevel('FATAL');
        request
            .get('/features/myfeature')
            .expect('Content-Type', /json/)
            .expect(404, done);
    });

    it('creates new feature toggle', done => {
        request
            .post('/features')
            .send({ name: 'com.test.feature', enabled: false })
            .set('Content-Type', 'application/json')
            .expect(201, done);
    });

    it('creates new feature toggle with createdBy', done => {
        logger.setLevel('FATAL');
        request
            .post('/features')
            .send({ name: 'com.test.Username', enabled: false })
            .set('Cookie', ['username=ivaosthu'])
            .set('Content-Type', 'application/json')
            .end(() => {
                request
                    .get('/api/events')
                    .end((err, res) => {
                        assert.equal(res.body.events[0].createdBy, 'ivaosthu');
                        done();
                    });
            });
    });

    it('require new feature toggle to have a name', done => {
        logger.setLevel('FATAL');
        request
            .post('/features')
            .send({ name: '' })
            .set('Content-Type', 'application/json')
            .expect(400, done);
    });

    it('can not change status of feature toggle that does not exist', done => {
        logger.setLevel('FATAL');
        request
            .put('/features/should-not-exist')
            .send({ name: 'should-not-exist', enabled: false })
            .set('Content-Type', 'application/json')
            .expect(404, done);
    });

    it('can change status of feature toggle that does exist', done => {
        logger.setLevel('FATAL');
        request
            .put('/features/featureY')
            .send({ name: 'featureY', enabled: true })
            .set('Content-Type', 'application/json')
            .expect(200, done);
    });

    it('archives a feature by name', done => {
        request
            .delete('/features/featureX')
            .expect(200, done);
    });

    it('can not archive unknown feature', done => {
        request
            .delete('/features/featureUnknown')
            .expect(404, done);
    });

    it('refuses to create a feature with an existing name', done => {
        request
            .post('/features')
            .send({ name: 'featureX' })
            .set('Content-Type', 'application/json')
            .expect(403, done);
    });

    it('refuses to validate a feature with an existing name', done => {
        request
            .post('/features-validate')
            .send({ name: 'featureX' })
            .set('Content-Type', 'application/json')
            .expect(403, done);
    });

    describe('new strategies api', () => {
        it('automatically map existing strategy to strategies array', (done) => {
            request
                .get('/features/featureY')
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    assert.equal(res.body.strategies.length, 1, 'expected strategy added to strategies');
                    assert.equal(res.body.strategy, res.body.strategies[0].name);
                    assert.deepEqual(res.body.parameters, res.body.strategies[0].parameters);
                    done();
                });
        });

        it('can add two strategies to a feature toggle', (done) => {
            request
                .put('/features/featureY')
                .send({
                    name: 'featureY',
                    description: 'soon to be the #14 feature',
                    enabled: false,
                    strategies: [
                        {
                            name: 'baz',
                            parameters: { foo: 'bar' },
                        },
                    ] })
                .set('Content-Type', 'application/json')
                .expect(200, done);
        });

        it('should not be allowed to post both strategy and strategies', (done) => {
            logger.setLevel('FATAL');
            request
                .post('/features')
                .send({
                    name: 'featureConfusing',
                    description: 'soon to be the #14 feature',
                    enabled: false,
                    strategy: 'baz',
                    parameters: {},
                    strategies: [
                        {
                            name: 'baz',
                            parameters: { foo: 'bar' },
                        },
                    ] })
                .set('Content-Type', 'application/json')
                .expect(400, done);
        });
    });
});
