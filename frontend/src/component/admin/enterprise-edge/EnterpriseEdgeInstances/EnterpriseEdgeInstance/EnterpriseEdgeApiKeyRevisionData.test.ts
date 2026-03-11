import { describe, expect, it } from 'vitest';
import { expectedUpstreamRevisionId } from './EnterpriseEdgeApiKeyRevisionData';

describe('expectedUpstreamRevisionId', () => {
    const revisionIds = [
        {
            environment: 'development',
            revisionId: 12,
        },
        {
            environment: 'development',
            projects: ['two'],
            revisionId: 27,
        },
        {
            environment: 'development',
            projects: ['three', 'two'],
            revisionId: 34,
        },
    ];

    it('uses exact project match when available', () => {
        const upstreamRevision = expectedUpstreamRevisionId(revisionIds, {
            environment: 'development',
            projects: ['three', 'two'],
            revisionId: 33,
            lastUpdated: new Date(),
        });

        expect(upstreamRevision).toBe(34);
    });

    it('does not use superset project revisions for narrower tokens', () => {
        const upstreamRevision = expectedUpstreamRevisionId(revisionIds, {
            environment: 'development',
            projects: ['two'],
            revisionId: 27,
            lastUpdated: new Date(),
        });

        expect(upstreamRevision).toBe(27);
    });

    it('uses the highest scoped revision for wildcard tokens', () => {
        const upstreamRevision = expectedUpstreamRevisionId(revisionIds, {
            environment: 'development',
            projects: ['*'],
        });

        expect(upstreamRevision).toBe(34);
    });

    it('falls back to the environment-wide revision when no project scope matches', () => {
        const upstreamRevision = expectedUpstreamRevisionId(revisionIds, {
            environment: 'development',
            projects: ['unknown-project'],
        });

        expect(upstreamRevision).toBe(12);
    });
});
