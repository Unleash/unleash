var specHelper = require('./specHelper');
var request = specHelper.request;

describe('The routes', function() {

    describe('healthcheck', function() {
        it('returns health good', function(done) {
            request.get('/health')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect('{"health":"GOOD"}', done);
        });
    });

});