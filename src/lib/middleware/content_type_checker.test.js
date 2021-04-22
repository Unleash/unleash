const requireContentType = require('./content_type_checker');

const mockRequest = contentType => ({
    header: name => {
        if (name === 'Content-Type') {
            return contentType;
        }
        return '';
    },
});

const returns415 = t => ({
    status: code => {
        expect(415).toBe(code);
        return {
            end: t,
        };
    },
});

const expectNoCall = t => ({
    status: () => ({
        end: t.fail,
    }),
});

test('Content-type middleware should by default only support application/json', done => {
    const middleware = requireContentType();
    middleware(mockRequest('application/json'), expectNoCall(done), done);
    middleware(mockRequest('text/plain'), returns415(done), done.fail);
});

test('Content-type middleware should allow adding custom supported types', done => {
    const middleware = requireContentType('application/yaml');
    middleware(mockRequest('application/yaml'), expectNoCall(done), done);
    middleware(mockRequest('text/html'), returns415(done), done.fail);
    middleware(mockRequest('text/plain'), returns415(done), done.fail);
});

test('adding custom supported types no longer supports default type', done => {
    const middleware = requireContentType('application/yaml');
    middleware(mockRequest('application/json'), returns415(done), done.fail);
});

test('Should be able to add multiple content-types supported', done => {
    const middleware = requireContentType(
        'application/json',
        'application/yaml',
        'form/multipart',
    );
    middleware(mockRequest('application/json'), expectNoCall(done), done);
    middleware(mockRequest('application/yaml'), expectNoCall(done), done);
    middleware(mockRequest('form/multipart'), expectNoCall(done), done);
    middleware(mockRequest('text/plain'), returns415(done), done.fail);
});
