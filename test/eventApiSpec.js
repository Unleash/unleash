var specHelper = require('./specHelper');

describe('The event api', function () {
    var request;

    before(function () { request = specHelper.setupMockServer(); });
    after(specHelper.tearDownMockServer);

    it('returns events', function (done) {
        request
            .get('/events')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('returns events given a name', function (done) {
        request
            .get('/events/myname')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

});