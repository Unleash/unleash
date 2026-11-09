import { describe, expect, it } from 'vitest';
import { appPath } from './appPath.ts';

describe('appPath', () => {
    it.each([
        ['/unleash/projects/default/', '/unleash', '/projects/default'],
        ['/unleash/projects/default', '/unleash', '/projects/default'],
        ['/unleash', '/unleash', '/'],
        ['/unleash/', '/unleash', '/'],
        ['/', '', '/'],
        ['/projects/', '', '/projects'],
        ['/other/projects/', '/unleash', '/other/projects'],
        ['/unleashed/projects', '/unleash', '/unleashed/projects'],
    ])('maps %s with base %s to %s', (pathname, basePath, expected) => {
        expect(appPath(pathname, basePath)).toBe(expected);
    });
});
