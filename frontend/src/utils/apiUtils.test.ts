import { describe, expect, test } from 'vitest';
import { apiErrorCategory, ConflictError } from './apiUtils.ts';

describe('apiErrorCategory', () => {
    test('buckets known API errors by their class', () => {
        expect(apiErrorCategory(new ConflictError())).toBe('conflict');
    });

    test('buckets a failed fetch as a network error', () => {
        expect(apiErrorCategory(new TypeError('fetch failed'))).toBe('network');
    });

    test('falls back to unknown for unrecognized errors', () => {
        expect(apiErrorCategory(new Error('boom'))).toBe('unknown');
    });
});
