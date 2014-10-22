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
            .send({name: 'com.test.feature', 'enabled': false})
            .set('Content-Type', 'application/json')
            .expect(201, done);
    });

    it('can not change status of feature toggle that dose not exsist', function (done) {
        request
            .patch('/features/shouldNotExsist')
            .send({
                'field': 'enabled',
                'value': true
            })
            .set('Content-Type', 'application/json')
            .expect(404, done);
    });

    it('can change status of feature toggle that dose exsist', function (done) {
        request
            .patch('/features/featureY')
            .send({
                'field': 'enabled',
                'value': true
            })
            .set('Content-Type', 'application/json')
            .expect(202, done);
    });

});