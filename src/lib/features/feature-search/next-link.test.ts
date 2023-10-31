import { nextLink } from './next-link';
import { Request } from 'express';

describe('nextLink', () => {
    it('should generate the correct next link with a cursor', () => {
        const req = {
            baseUrl: '/api/events',
            path: '/',
            query: { page: '2', limit: '10' },
        } as Pick<Request, 'baseUrl' | 'path' | 'query'>;

        const cursor = 'abc123';
        const result = nextLink(req, cursor);

        expect(result).toBe('/api/events/?page=2&limit=10&cursor=abc123');
    });

    it('should generate the correct next link without a cursor', () => {
        const req = {
            baseUrl: '/api/events',
            path: '/',
            query: { page: '2', limit: '10' },
        } as Pick<Request, 'baseUrl' | 'path' | 'query'>;

        const result = nextLink(req);

        expect(result).toBe('');
    });

    it('should exclude existing cursor from query parameters', () => {
        const req = {
            baseUrl: '/api/events',
            path: '/',
            query: { page: '2', limit: '10', cursor: 'oldCursor' },
        } as Pick<Request, 'baseUrl' | 'path' | 'query'>;

        const cursor = 'newCursor';
        const result = nextLink(req, cursor);

        expect(result).toBe('/api/events/?page=2&limit=10&cursor=newCursor');
    });

    it('should handle empty query parameters correctly', () => {
        const req = {
            baseUrl: '/api/events',
            path: '/',
            query: {},
        } as Pick<Request, 'baseUrl' | 'path' | 'query'>;

        const cursor = 'abc123';
        const result = nextLink(req, cursor);

        expect(result).toBe('/api/events/?cursor=abc123');
    });
});
