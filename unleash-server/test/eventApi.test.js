var request = require('supertest'),
    mockery = require('mockery');

describe('The event api', function () {
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

    it('returns events', function (done) {
        request
            .get('/events')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

});