import { beforeEach, describe, expect, test, vi } from 'vitest';
import { toLocalStorageName } from './localStorageName.ts';

const mockedFormatPath = vi.hoisted(() => ({ basePath: '' }));

vi.mock('./formatPath.js', () => ({
    get basePath() {
        return mockedFormatPath.basePath;
    },
}));

describe('toLocalStorageName', () => {
    beforeEach(() => {
        mockedFormatPath.basePath = '';
    });

    test('names the key without a prefix when there is no base path', () => {
        expect(toLocalStorageName('hidden-environments:v1')).toBe(
            ':hidden-environments:v1:localStorage:v2',
        );
    });

    test('prefixes the key with the base path', () => {
        mockedFormatPath.basePath = '/unleash';

        expect(toLocalStorageName('hidden-environments:v1')).toBe(
            '/unleash:hidden-environments:v1:localStorage:v2',
        );
    });
});
