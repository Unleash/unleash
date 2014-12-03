var request = require('supertest');
var mockery = require('mockery');

process.env.NODE_ENV = 'test';

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

    var app = require('../app');

    return request(app);
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