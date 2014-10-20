var request = require('supertest');

request = request('http://localhost:4242');

describe('The api', function () {
    var server;

    before(function () {
        server = require('../server');
    });

    after(function () {
        server.server.close();
    });

    it('returns three mocked feature toggles', function (done) {
        request
            .get('/features')
            .expect(200, done);
    });

    it('creates new feature toggle', function (done) {
        request
            .post('/features')
            .send({name: 'featureAss', 'status': 'off'})
            .set('Content-Type', 'application/json')
            .expect(201, done);
    });
});