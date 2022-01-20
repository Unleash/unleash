import { Request, Response } from 'express';
import requireContentType from './content_type_checker';

const mockRequest: (contentType: string) => Request = (contentType) => ({
    // @ts-ignore
    header: (name) => {
        if (name === 'Content-Type') {
            return contentType;
        }
        return '';
    },
});

const returns415: (t: jest.Mock) => Response = (t) => ({
    // @ts-ignore
    status: (code) => {
        expect(415).toBe(code);
        return {
            end: t,
        };
    },
});

const expectNoCall: (t: jest.Mock) => Response = (t) => ({
    // @ts-ignore
    status: () => ({
        end: () => expect(t).toHaveBeenCalledTimes(0),
    }),
});

test('Content-type middleware should by default only support application/json', () => {
    const middleware = requireContentType();
    const t = jest.fn();
    const fail = jest.fn();
    middleware(mockRequest('application/json'), expectNoCall(fail), t);
    middleware(mockRequest('text/plain'), returns415(t), fail);
    expect(t).toHaveBeenCalledTimes(2);
    expect(fail).toHaveBeenCalledTimes(0);
});

test('Content-type middleware should by default only support application/json with charset', () => {
    const middleware = requireContentType();
    const t = jest.fn();
    const fail = jest.fn();
    middleware(
        mockRequest('application/json; charset=UTF-8'),
        expectNoCall(fail),
        t,
    );
    middleware(mockRequest('text/plain'), returns415(t), fail);
    expect(t).toHaveBeenCalledTimes(2);
    expect(fail).toHaveBeenCalledTimes(0);
});

test('Content-type middleware should allow adding custom supported types', () => {
    const middleware = requireContentType('application/yaml');
    const t = jest.fn();
    const fail = jest.fn();
    middleware(mockRequest('application/yaml'), expectNoCall(fail), t);
    middleware(mockRequest('text/html'), returns415(t), fail);
    middleware(mockRequest('text/plain'), returns415(t), fail);
    expect(t).toHaveBeenCalledTimes(3);
    expect(fail).toHaveBeenCalledTimes(0);
});

test('adding custom supported types no longer supports default type', () => {
    const middleware = requireContentType('application/yaml');
    const t = jest.fn();
    const fail = jest.fn();
    middleware(mockRequest('application/json'), returns415(t), fail);
    expect(t).toHaveBeenCalledTimes(1);
    expect(fail).toHaveBeenCalledTimes(0);
});

test('Should be able to add multiple content-types supported', () => {
    const middleware = requireContentType(
        'application/json',
        'application/yaml',
        'form/multipart',
    );
    const fail = jest.fn();
    const succeed = jest.fn();
    middleware(mockRequest('application/json'), expectNoCall(fail), succeed);
    middleware(mockRequest('application/yaml'), expectNoCall(fail), succeed);
    middleware(mockRequest('form/multipart'), expectNoCall(fail), succeed);
    middleware(mockRequest('text/plain'), returns415(succeed), fail);
    expect(succeed).toHaveBeenCalledTimes(4);
    expect(fail).toHaveBeenCalledTimes(0);
});
