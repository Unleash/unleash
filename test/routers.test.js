var request = require('supertest'),
    mockery = require('mockery');

describe('The routes', function () {
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

    describe('healthcheck', function () {

        it('returns health good', function (done) {
            request.get('/health')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect('{"health":"GOOD"}', done);
        });
    });

});