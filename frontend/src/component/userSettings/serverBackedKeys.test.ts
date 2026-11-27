import { describe, expect, test, vi } from 'vitest';
import { createServerBackedKeys } from './serverBackedKeys.ts';

vi.mock('utils/localStorageName', () => ({
    toLocalStorageName: (key: string) => `local-storage-name-of:${key}`,
}));

describe('createServerBackedKeys', () => {
    test('pairs every key with its local storage name', () => {
        expect(
            createServerBackedKeys([
                'hidden-environments:v1',
                'survey-grace:v1',
            ]),
        ).toEqual([
            {
                key: 'hidden-environments:v1',
                localStorageName:
                    'local-storage-name-of:hidden-environments:v1',
            },
            {
                key: 'survey-grace:v1',
                localStorageName: 'local-storage-name-of:survey-grace:v1',
            },
        ]);
    });
});
