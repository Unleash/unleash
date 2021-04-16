const test = require('ava');

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
        t.is(415, code);
        return {
            end: t.pass,
        };
    },
});

const expectNoCall = t => ({
    status: () => ({
        end: t.fail,
    }),
});

test('Content-type middleware should by default only support application/json', t => {
    const middleware = requireContentType();
    middleware(mockRequest('application/json'), expectNoCall(t), t.pass);
    middleware(mockRequest('text/plain'), returns415(t), t.fail);
});

test('Content-type middleware should allow adding custom supported types', t => {
    const middleware = requireContentType('application/yaml');
    middleware(mockRequest('application/yaml'), expectNoCall(t), t.pass);
    middleware(mockRequest('text/html'), returns415(t), t.fail);
    middleware(mockRequest('text/plain'), returns415(t), t.fail);
});

test('adding custom supported types no longer supports default type', t => {
    const middleware = requireContentType('application/yaml');
    middleware(mockRequest('application/json'), returns415(t), t.fail);
});

test('Should be able to add multiple content-types supported', t => {
    const middleware = requireContentType(
        'application/json',
        'application/yaml',
        'form/multipart',
    );
    middleware(mockRequest('application/json'), expectNoCall(t), t.pass);
    middleware(mockRequest('application/yaml'), expectNoCall(t), t.pass);
    middleware(mockRequest('form/multipart'), expectNoCall(t), t.pass);
    middleware(mockRequest('text/plain'), returns415(t), t.fail);
});
