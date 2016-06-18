'use strict';
var assert     = require('assert');
var specHelper = require('./specHelper');
var request    = specHelper.request;
var stringify  = function (o) {
    return JSON.stringify(o, null, ' ');
};

describe('The archive features api', function () {
    beforeEach(function (done) {
        specHelper.db.resetAndSetup()
            .then(done.bind(null, null))
            .catch(done);
    });

    it('returns three archived toggles', function (done) {
        request
            .get('/archive/features')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                assert(res.body.features.length === 3, "expected 3 features, got " + stringify(res.body));
                done();
            });
    });

    it('revives a feature by name', function (done) {
        request
            .post('/archive/revive')
            .send({ name: 'featureArchivedX' })
            .set('Content-Type', 'application/json')
            .expect(200, done);
    });

    it('must set name when reviving toggle', function (done) {
        request
            .post('/archive/revive')
            .expect(400, done);
    });
});
