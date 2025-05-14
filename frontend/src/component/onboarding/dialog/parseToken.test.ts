import { parseToken } from './parseToken.js';

describe('parseToken', () => {
    test('should return null if token is undefined', () => {
        const result = parseToken(undefined);
        expect(result).toBeNull();
    });

    test('should return null if token is an empty string', () => {
        const result = parseToken('');
        expect(result).toBeNull();
    });

    test('should return the correct object when a valid token is provided', () => {
        const token = 'project123:env456.secret789';
        const result = parseToken(token);
        expect(result).toEqual({
            project: 'project123',
            environment: 'env456',
            secret: 'secret789',
        });
    });

    test('should return null if the token does not have a colon', () => {
        const token = 'project123env456.secret789';
        const result = parseToken(token);
        expect(result).toBeNull();
    });

    test('should return null if the token does not have a period', () => {
        const token = 'project123:env456secret789';
        const result = parseToken(token);
        expect(result).toBeNull();
    });

    test('should return null if the token has an incomplete project part', () => {
        const token = ':env456.secret789';
        const result = parseToken(token);
        expect(result).toBeNull();
    });

    test('should return null if the token has an incomplete environment part', () => {
        const token = 'project123:.secret789';
        const result = parseToken(token);
        expect(result).toBeNull();
    });

    test('should return null if the token has an incomplete secret part', () => {
        const token = 'project123:env456.';
        const result = parseToken(token);
        expect(result).toBeNull();
    });

    test('should return null if the token has extra parts', () => {
        const token = 'project123:env456.secret789.extra';
        const result = parseToken(token);
        expect(result).toBeNull();
    });
});
