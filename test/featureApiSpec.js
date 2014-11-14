var request = require('supertest');
var mockery = require('mockery');

describe('The api', function () {
    var server;

    before(function () {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });

        mockery.registerSubstitute('./eventDb', '../test/eventDbMock');
        mockery.registerSubstitute('./featureDb', '../test/featureDbMock');

        server = require('../server');
        request = request('http://localhost:' + server.app.get('port'));
    });

    after(function () {
        mockery.disable();
        mockery.deregisterAll();
        server.server.close();
    });

    it('returns three mocked feature toggles', function (done) {
        request
            .get('/features')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('creates new feature toggle', function (done) {
        request
            .post('/features')
            .send({name: 'com.test.feature', 'enabled': false})
            .set('Content-Type', 'application/json')
            .expect(201, done);
    });

    it('require new feature toggle to have a name', function (done) {
        request
            .post('/features')
            .send({name: ''})
            .set('Content-Type', 'application/json')
            .expect(400, done);
    });

    it('can not change status of feature toggle that does not exist', function (done) {
        request
            .put('/features/should-not-exist')
            .send({name: 'should-not-exist', enabled: false})
            .set('Content-Type', 'application/json')
            .expect(404, done);
    });

    it('can change status of feature toggle that does exist', function (done) {
        request
            .put('/features/featureY')
            .send({name: 'featureY', enabled: true})
            .set('Content-Type', 'application/json')
            .expect(200, done);
    });

});