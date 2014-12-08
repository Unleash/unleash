var specHelper = require('./specHelper');

describe('The strategy api', function () {
    var request;

    before(function () { request = specHelper.setupMockServer(); });
    after(specHelper.tearDownMockServer);

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

    it('deletes a new strategy', function (done) {
        request
            .delete('/strategies/deletable')
            .expect(200, done);
    });
});