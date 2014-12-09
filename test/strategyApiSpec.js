var specHelper = require('./specHelper');
var request    = specHelper.request;

describe('The strategy api', function () {
    beforeEach(function (done) {
        specHelper.db.resetAndSetup()
            .then(done.bind(null, null))
            .catch(done);
    });

    it('gets all strategies', function (done) {
        request
            .get('/strategies')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('gets a strategy by name', function (done) {
        request
            .get('/strategies/default')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('creates a new strategy', function (done) {
        request
            .post('/strategies')
            .send({name: 'myCustomStrategy', description: 'Best strategy ever.'})
            .set('Content-Type', 'application/json')
            .expect(201, done);
    });

    it('requires new strategies to have a name', function (done) {
        request
            .post('/strategies')
            .send({name: ''})
            .set('Content-Type', 'application/json')
            .expect(400, done);
    });

    it('refuses to create a strategy with an existing name', function (done) {
        request
            .post('/strategies')
            .send({name: 'default'})
            .set('Content-Type', 'application/json')
            .expect(403, done);
    });


});