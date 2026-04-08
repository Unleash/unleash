import { describe, expect, test } from 'vitest';
import { getVisibleRevision } from './visible-revision.js';
import type { EnvironmentVisibleRevisionState } from './client-feature-toggle-delta.js';

const revisionState: EnvironmentVisibleRevisionState = {
    projectRevisions: new Map([
        ['alpha', 11],
        ['beta', 14],
    ]),
    globalSegmentRevision: 12,
};

describe('getVisibleRevisionForProjects', () => {
    test('returns all-project revision for wildcard query', () => {
        expect(getVisibleRevision(revisionState, ['*'])).toBe(14);
    });

    test('uses wildcard semantics for empty project list', () => {
        expect(getVisibleRevision(revisionState, [])).toBe(14);
    });

    test('returns max project or segment revision for project-scoped query', () => {
        expect(getVisibleRevision(revisionState, ['alpha'])).toBe(12);
        expect(getVisibleRevision(revisionState, ['alpha', 'beta'])).toBe(14);
    });

    test('returns 0 when scoped query has no revision state', () => {
        expect(getVisibleRevision(undefined, ['alpha'])).toBe(0);
    });
});
