'use strict';

const specHelper = require('./util/test-helper');
let request;

describe('The strategy api', () => {
    beforeEach(done => {
        specHelper.setupApp().then((app) => {
            request = app.request;
            done();
        });
    });

    it('gets all strategies', done => {
        request
            .get('/api/strategies')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('gets a strategy by name', done => {
        request
            .get('/api/strategies/default')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('cant get a strategy by name that dose not exist', done => {
        request
            .get('/api/strategies/mystrategy')
            .expect('Content-Type', /json/)
            .expect(404, done);
    });

    it('creates a new strategy', done => {
        request
            .post('/api/strategies')
            .send({ name: 'myCustomStrategy', description: 'Best strategy ever.' })
            .set('Content-Type', 'application/json')
            .expect(201, done);
    });

    it('requires new strategies to have a name', done => {
        request
            .post('/api/strategies')
            .send({ name: '' })
            .set('Content-Type', 'application/json')
            .expect(400, done);
    });

    it('refuses to create a strategy with an existing name', done => {
        request
            .post('/api/strategies')
            .send({ name: 'default' })
            .set('Content-Type', 'application/json')
            .expect(403, done);
    });

    it('deletes a new strategy', done => {
        request
            .delete('/api/strategies/usersWithEmail')
            .expect(200, done);
    });

    it('can\'t delete a strategy that dose not exist', done => {
        request
            .delete('/api/strategies/unknown')
            .expect(404, done);
    });
});
