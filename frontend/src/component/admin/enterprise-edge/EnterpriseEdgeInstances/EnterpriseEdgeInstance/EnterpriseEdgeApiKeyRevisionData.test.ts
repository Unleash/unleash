import { describe, expect, it } from 'vitest';
import { expectedUpstreamRevisionId } from './EnterpriseEdgeApiKeyRevisionData';

describe('expectedUpstreamRevisionId', () => {
    const revisionIds = [
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
});
