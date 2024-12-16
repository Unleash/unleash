import { RevisionDelta } from './revision-delta';
import type { Revision } from './client-feature-toggle-delta';

describe('RevisionCache', () => {
    it('should create a new base when trying to add a new revision at the max limit', () => {
        const initialRevisions: Revision[] = [
            {
                revisionId: 1,
                updated: [
                    {
                        name: 'test-flag',
                        type: 'release',
                        enabled: false,
                        project: 'default',
                        stale: false,
                        strategies: [
                            {
                                name: 'flexibleRollout',
                                constraints: [],
                                parameters: {
                                    groupId: 'test-flag',
                                    rollout: '100',
                                    stickiness: 'default',
                                },
                                variants: [],
                            },
                        ],
                        variants: [],
                        description: null,
                        impressionData: false,
                    },
                ],
                removed: [],
            },
            {
                revisionId: 2,
                updated: [
                    {
                        name: 'my-feature-flag',
                        type: 'release',
                        enabled: true,
                        project: 'default',
                        stale: false,
                        strategies: [
                            {
                                name: 'flexibleRollout',
                                constraints: [],
                                parameters: {
                                    groupId: 'my-feature-flag',
                                    rollout: '100',
                                    stickiness: 'default',
                                },
                                variants: [],
                            },
                        ],
                        variants: [],
                        description: null,
                        impressionData: false,
                    },
                ],
                removed: [],
            },
        ];

        const maxLength = 2;
        const deltaCache = new RevisionDelta(initialRevisions, maxLength);

        // Add a new revision to trigger changeBase
        deltaCache.addRevision({
            revisionId: 3,
            updated: [
                {
                    name: 'another-feature-flag',
                    type: 'release',
                    enabled: true,
                    project: 'default',
                    stale: false,
                    strategies: [
                        {
                            name: 'flexibleRollout',
                            constraints: [],
                            parameters: {
                                groupId: 'another-feature-flag',
                                rollout: '100',
                                stickiness: 'default',
                            },
                            variants: [],
                        },
                    ],
                    variants: [],
                    description: null,
                    impressionData: false,
                },
            ],
            removed: [],
        });

        const revisions = deltaCache.getRevisions();

        // Check that the base has been changed and merged correctly
        expect(revisions.length).toBe(2);
        expect(revisions[0].updated.length).toBe(2);
        expect(revisions[0].updated).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: 'test-flag' }),
                expect.objectContaining({ name: 'my-feature-flag' }),
            ]),
        );
    });
});
