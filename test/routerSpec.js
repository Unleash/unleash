var specHelper = require('./specHelper');

describe('The routes', function () {
    var request;

    before(function () { request = specHelper.setupMockServer(); });
    after(specHelper.tearDownMockServer);

    describe('healthcheck', function () {
        it('returns health good', function (done) {
            request.get('/health')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect('{"health":"GOOD"}', done);
        });
    });

});