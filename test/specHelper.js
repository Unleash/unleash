var request = require('supertest');
var mockery = require('mockery');

var server;

function setupMockServer() {
    mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false,
        useCleanCache: true
    });

    mockery.registerSubstitute('./eventDb', '../test/eventDbMock');
    mockery.registerSubstitute('./featureDb', '../test/featureDbMock');
    mockery.registerSubstitute('./strategyDb', '../test/strategyDbMock');

    server = require('../server');

    return request('http://localhost:' + server.app.get('port'));
}

function tearDownMockServer() {
    mockery.disable();
    mockery.deregisterAll();

    if (server) {
        server.server.close();
        server = null;
    }
}

module.exports = {
    setupMockServer: setupMockServer,
    tearDownMockServer: tearDownMockServer
};