import type { Request, Response } from 'express';
import requireContentType from './content_type_checker.js';
import { type Mock, vi } from 'vitest';

const mockRequest: (contentType: string) => Request = (contentType) => ({
    // @ts-expect-error
    header: (name) => {
        if (name === 'Content-Type') {
            return contentType;
        }
        return '';
    },
});

const returns415: (t: Mock) => Response = (t) => ({
    // @ts-expect-error
    status: (code) => {
        expect(415).toBe(code);
        return {
            json: () => ({
                end: t,
            }),
        };
    },
});

const expectNoCall: (t: Mock) => Response = (t) => ({
    status: () => ({
        json: () => ({
            // @ts-expect-error
            end: () => expect(t).toHaveBeenCalledTimes(0),
        }),
    }),
});

test('Content-type middleware should by default only support application/json', () => {
    const middleware = requireContentType();
    const t = vi.fn();
    const fail = vi.fn();
    middleware(mockRequest('application/json'), expectNoCall(fail), t);
    middleware(mockRequest('text/plain'), returns415(t), fail);
    expect(t).toHaveBeenCalledTimes(2);
    expect(fail).toHaveBeenCalledTimes(0);
});

test('Content-type middleware should by default only support application/json with charset', () => {
    const middleware = requireContentType();
    const t = vi.fn();
    const fail = vi.fn();
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
    const t = vi.fn();
    const fail = vi.fn();
    middleware(mockRequest('application/yaml'), expectNoCall(fail), t);
    middleware(mockRequest('text/html'), returns415(t), fail);
    middleware(mockRequest('text/plain'), returns415(t), fail);
    expect(t).toHaveBeenCalledTimes(3);
    expect(fail).toHaveBeenCalledTimes(0);
});

test('adding custom supported types no longer supports default type', () => {
    const middleware = requireContentType('application/yaml');
    const t = vi.fn();
    const fail = vi.fn();
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
    const fail = vi.fn();
    const succeed = vi.fn();
    middleware(mockRequest('application/json'), expectNoCall(fail), succeed);
    middleware(mockRequest('application/yaml'), expectNoCall(fail), succeed);
    middleware(mockRequest('form/multipart'), expectNoCall(fail), succeed);
    middleware(mockRequest('text/plain'), returns415(succeed), fail);
    expect(succeed).toHaveBeenCalledTimes(4);
    expect(fail).toHaveBeenCalledTimes(0);
});
