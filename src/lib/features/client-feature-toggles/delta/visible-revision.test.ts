import { describe, expect, test } from 'vitest';
import { getVisibleRevision } from './visible-revision.js';
import type { EnvironmentVisibleRevisionState } from './client-feature-toggle-delta.js';

const revisionState: EnvironmentVisibleRevisionState = {
    projectRevisions: new Map([
        ['alpha', 11],
        ['beta', 14],
    ]),
    segmentRevisions: new Map([
        [1, 12],
        [2, 13],
    ]),
};

describe('getVisibleRevision', () => {
    test('returns all-project revision for wildcard query', () => {
        expect(
            getVisibleRevision(revisionState, [
                {
                    name: 'alpha-feature',
                    project: 'alpha',
                    enabled: true,
                },
                {
                    name: 'beta-feature',
                    project: 'beta',
                    enabled: true,
                    strategies: [{ name: 'default', segments: [2] }],
                },
            ] as any),
        ).toBe(14);
    });

    test('uses wildcard semantics for empty project list', () => {
        expect(
            getVisibleRevision(revisionState, [
                {
                    name: 'alpha-feature',
                    project: 'alpha',
                    enabled: true,
                },
                {
                    name: 'beta-feature',
                    project: 'beta',
                    enabled: true,
                    strategies: [{ name: 'default', segments: [2] }],
                },
            ] as any),
        ).toBe(14);
    });

    test('returns the environment-wide visible revision', () => {
        expect(
            getVisibleRevision(revisionState, [
                {
                    name: 'alpha-feature',
                    project: 'alpha',
                    enabled: true,
                    strategies: [{ name: 'default', segments: [1] }],
                },
            ] as any),
        ).toBe(14);
        expect(
            getVisibleRevision(revisionState, [
                {
                    name: 'alpha-feature',
                    project: 'alpha',
                    enabled: true,
                    strategies: [{ name: 'default', segments: [1] }],
                },
                {
                    name: 'beta-feature',
                    project: 'beta',
                    enabled: true,
                    strategies: [{ name: 'default', segments: [2] }],
                },
            ] as any),
        ).toBe(14);
    });

    test('returns 0 when there is no revision state', () => {
        expect(getVisibleRevision(undefined, [])).toBe(0);
    });

    test('ignores segment revisions that are not referenced by visible features, but still keeps project revisions environment-wide', () => {
        expect(
            getVisibleRevision(revisionState, [
                {
                    name: 'alpha-feature',
                    project: 'alpha',
                    enabled: true,
                },
            ] as any),
        ).toBe(14);
    });
});
