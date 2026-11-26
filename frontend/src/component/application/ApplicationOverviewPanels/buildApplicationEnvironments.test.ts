import { expect, test } from 'vitest';
import type { ApiTokenSchema } from 'openapi';
import { buildApplicationEnvironments } from './buildApplicationEnvironments.ts';

const token = (
    tokenName: string,
    environment: string,
    projects: string[],
    extra: Partial<ApiTokenSchema> = {},
): ApiTokenSchema => ({
    tokenName,
    environment,
    type: 'backend',
    projects,
    createdAt: '2026-11-17T10:00:00.000Z',
    ...extra,
});

const activity = (name: string, instanceCount: number) => ({
    name,
    instanceCount,
    lastSeen: '2026-11-25T10:00:00.000Z',
    sdks: [],
    frontendSdks: [],
    backendSdks: [],
    issues: { missingFeatures: [], outdatedSdks: [] },
});

const environments = [
    { name: 'development', sortOrder: 1, enabled: true, type: 'development' },
    { name: 'staging', sortOrder: 2, enabled: true, type: 'test' },
    { name: 'production', sortOrder: 3, enabled: true, type: 'production' },
    { name: 'retired', sortOrder: 4, enabled: false, type: 'test' },
];

test('lists every enabled environment, and any other with a token or activity, in Unleash order', () => {
    const result = buildApplicationEnvironments({
        overview: {
            environments: [
                activity('retired', 2),
                activity('production', 8),
                activity('legacy', 1),
            ],
            projects: [],
        },
        tokens: [
            token('prod', 'production', ['dx']),
            token('stage', 'staging', ['dx']),
        ],
        environments,
    });

    expect(result).toMatchObject([
        { name: 'development', instanceCount: 0, tokens: [], linked: false },
        { name: 'staging', instanceCount: 0, lastSeen: null, linked: true },
        { name: 'production', instanceCount: 8, type: 'production' },
        { name: 'retired', instanceCount: 2, enabled: false },
        {
            name: 'legacy',
            instanceCount: 1,
            enabled: false,
            tokens: [],
            linked: false,
            linkedProjects: [],
        },
    ]);
    expect(result[1].tokens.map((t) => t.tokenName)).toEqual(['stage']);
});

test("an environment's linked projects are those of its tokens that have not expired", () => {
    const result = buildApplicationEnvironments({
        overview: { environments: [], projects: [] },
        tokens: [
            token('a', 'production', ['eg', 'dx']),
            token('b', 'production', ['dx'], {
                expiresAt: '2999-01-01T00:00:00.000Z',
            }),
            token('old', 'production', ['sa'], {
                expiresAt: '2020-01-01T00:00:00.000Z',
            }),
            token('all', 'staging', ['*']),
            token('one', 'staging', ['dx']),
        ],
        environments,
    });

    expect(result.map((e) => [e.name, e.linkedProjects])).toEqual([
        ['development', []],
        ['staging', ['*']],
        ['production', ['dx', 'eg']],
    ]);
    expect(result[2].tokens).toHaveLength(3);
});

test('an environment whose only token expired is not linked', () => {
    const production = buildApplicationEnvironments({
        overview: { environments: [activity('production', 8)], projects: [] },
        tokens: [
            token('old', 'production', ['dx'], {
                expiresAt: '2020-01-01T00:00:00.000Z',
            }),
        ],
        environments,
    }).find((e) => e.name === 'production');

    expect(production).toMatchObject({ linked: false, linkedProjects: [] });
    expect(production?.tokens).toHaveLength(1);
});

test('observed projects are placed in an environment only when it alone reports', () => {
    const observedIn = (reporting: string[]) =>
        buildApplicationEnvironments({
            overview: {
                environments: reporting.map((name) => activity(name, 1)),
                projects: ['mobile', 'dx', 'eg'],
            },
            tokens: [token('prod', 'production', ['eg'])],
            environments,
        }).map((e) => [e.name, e.observedProjects]);

    expect(observedIn(['production'])).toEqual([
        ['development', []],
        ['staging', []],
        ['production', ['dx', 'mobile']],
    ]);
    expect(observedIn(['production', 'staging'])).toEqual([
        ['development', []],
        ['staging', []],
        ['production', []],
    ]);
});
