var specHelper = require('./specHelper');
var request    = specHelper.request;

describe('The event api', function () {

    beforeEach(function (done) {
        specHelper.db.resetAndSetup()
            .then(done.bind(null, null))
            .catch(done);
    });

    it('returns events', function (done) {
        request
            .get('/events')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('returns events given a name', function (done) {
        request
            .get('/events/featureX')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('cant find event that dose not exist', function (done) {
        request
            .get('/events/thisisnoevent')
            .expect('Content-Type', /json/)
            .expect(404, done);
    });

});