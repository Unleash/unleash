import { describe, expect, test } from 'vitest';
import {
    getVisibleRevisionForProjects,
    type VisibleRevisionState,
} from './visible-revision.js';

const revisionState: VisibleRevisionState = {
    projectRevisions: new Map([
        ['alpha', 11],
        ['beta', 14],
    ]),
    globalSegmentRevision: 12,
};

describe('getVisibleRevisionForProjects', () => {
    test('returns all-project revision for wildcard query', () => {
        expect(getVisibleRevisionForProjects(revisionState, ['*'], 99)).toBe(
            99,
        );
    });

    test('uses wildcard semantics for empty project list', () => {
        expect(getVisibleRevisionForProjects(revisionState, [], 77)).toBe(77);
    });

    test('returns max project or segment revision for project-scoped query', () => {
        expect(
            getVisibleRevisionForProjects(revisionState, ['alpha'], 99),
        ).toBe(12);
        expect(
            getVisibleRevisionForProjects(revisionState, ['alpha', 'beta'], 99),
        ).toBe(14);
    });

    test('returns 0 when scoped query has no revision state', () => {
        expect(getVisibleRevisionForProjects(undefined, ['alpha'], 99)).toBe(0);
    });
});
