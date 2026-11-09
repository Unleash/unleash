import { describe, expect, it } from 'vitest';
import {
    normalizeRepositories,
    toAppNameRepoMap,
    toMappings,
    toRepositories,
} from './GithubAppNameRepoMap';

describe('reading the stored mappings', () => {
    it('groups rows by project and app name', () => {
        expect(
            toAppNameRepoMap([
                { project: 'edge', appName: 'my-app', repository: 'one' },
                { project: 'edge', appName: 'my-app', repository: 'two' },
                { project: 'edge', appName: 'other-app', repository: 'two' },
                { project: 'api', appName: 'my-app', repository: 'one' },
            ]),
        ).toEqual({
            edge: { 'my-app': ['one', 'two'], 'other-app': ['two'] },
            api: { 'my-app': ['one'] },
        });
    });

    it('ignores duplicate rows', () => {
        expect(
            toAppNameRepoMap([
                { project: 'edge', appName: 'my-app', repository: 'one' },
                { project: 'edge', appName: 'my-app', repository: 'one' },
            ]),
        ).toEqual({ edge: { 'my-app': ['one'] } });
    });

    it('skips rows that are not mappings', () => {
        expect(
            toAppNameRepoMap([
                { project: 'edge', appName: 'my-app', repository: 'one' },
                { project: 'edge', appName: 'my-app' },
                { project: 'edge', appName: 1, repository: 'one' },
                'not an object',
                null,
            ]),
        ).toEqual({ edge: { 'my-app': ['one'] } });
    });

    it('treats anything that is not an array as empty', () => {
        expect(toAppNameRepoMap(undefined)).toEqual({});
        expect(toAppNameRepoMap('a string')).toEqual({});
        expect(toAppNameRepoMap({ edge: {} })).toEqual({});
    });
});

describe('writing the mappings back', () => {
    it('flattens to one row per repository', () => {
        expect(
            toMappings({
                edge: { 'my-app': ['one', 'two'] },
                api: { 'my-app': ['one'] },
            }),
        ).toEqual([
            { project: 'edge', appName: 'my-app', repository: 'one' },
            { project: 'edge', appName: 'my-app', repository: 'two' },
            { project: 'api', appName: 'my-app', repository: 'one' },
        ]);
    });

    it('drops app names with no repositories selected', () => {
        expect(
            toMappings({ edge: { 'my-app': [], 'other-app': ['one'] } }),
        ).toEqual([
            { project: 'edge', appName: 'other-app', repository: 'one' },
        ]);
    });

    it('round-trips', () => {
        const stored = [
            { project: 'edge', appName: 'my-app', repository: 'one' },
            { project: 'edge', appName: 'my-app', repository: 'two' },
            { project: 'api', appName: 'other-app', repository: 'three' },
        ];

        expect(toMappings(toAppNameRepoMap(stored))).toEqual(stored);
    });
});

describe('entering repositories', () => {
    it('trims, drops empty entries and removes duplicates', () => {
        expect(normalizeRepositories([' a ', 'b', '', 'a', '  '])).toEqual([
            'a',
            'b',
        ]);
    });
});

describe('reading the synced repositories', () => {
    it('sorts and removes duplicates', () => {
        expect(toRepositories(['web', 'api', 'web'])).toEqual(['api', 'web']);
    });

    it('skips entries that are not strings', () => {
        expect(toRepositories(['web', 1, null, { name: 'api' }])).toEqual([
            'web',
        ]);
    });

    it('treats anything that is not an array as empty', () => {
        expect(toRepositories(undefined)).toEqual([]);
        expect(toRepositories('web')).toEqual([]);
    });
});
