import { describe, expect, it } from 'vitest';
import { scrubUrl } from './scrubUrl';

describe('scrubUrl', () => {
    it('masks segments after the first 3 character-by-character', () => {
        expect(
            scrubUrl('/api/admin/projects/my-project/features/my-flag'),
        ).toBe('/api/admin/projects/**********/********/*******');
    });

    it('masks query param values, preserving keys', () => {
        expect(scrubUrl('/api/admin/features?project=foo&tag=bar')).toBe(
            '/api/admin/features?project=***&tag=***',
        );
    });

    it('handles absolute URLs by discarding the host', () => {
        expect(
            scrubUrl('https://app.getunleash.io/api/admin/projects/secret'),
        ).toBe('/api/admin/projects/******');
    });

    it('returns what is available when path has fewer than 3 segments', () => {
        expect(scrubUrl('/api/admin')).toBe('/api/admin');
        expect(scrubUrl('/api')).toBe('/api');
    });

    it('returns / for root path', () => {
        expect(scrubUrl('/')).toBe('/');
    });

    it('returns exactly 3 segments unchanged when path has exactly 3', () => {
        expect(scrubUrl('/api/admin/features')).toBe('/api/admin/features');
    });
});
