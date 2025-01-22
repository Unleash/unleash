import { DeltaCache } from './delta-cache';
import {
    type DeltaEvent,
    type DeltaHydrationEvent,
    isDeltaHydrationEvent,
} from './client-feature-toggle-delta-types';

describe('RevisionCache', () => {
    it('should always update the hydration event and remove event when over limit', () => {
        const hydrationEvent: DeltaHydrationEvent = {
            eventId: 1,
            features: [
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
            type: 'hydration',
        };
        const initialEvents: DeltaEvent[] = [
            {
                eventId: 2,
                feature: {
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
                type: 'feature-updated',
            },
        ];

        const maxLength = 2;
        const deltaCache = new DeltaCache(hydrationEvent, maxLength);
        deltaCache.addEvents(initialEvents);

        // Add a new revision to trigger changeBase
        deltaCache.addEvents([
            {
                eventId: 3,
                type: 'feature-updated',
                feature: {
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
                        },
                    ],
                    variants: [],
                    description: null,
                    impressionData: false,
                },
            },
            {
                eventId: 4,
                type: 'feature-removed',
                featureName: 'test-flag',
                project: 'default',
            },
        ]);

        const events = deltaCache.getEvents();

        // Check that the base has been changed and merged correctly
        expect(events.length).toBe(2);

        const event = events[0];
        if (isDeltaHydrationEvent(event)) {
            expect(event.features).toHaveLength(2);
            expect(event.features).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ name: 'my-feature-flag' }),
                    expect.objectContaining({ name: 'another-feature-flag' }),
                ]),
            );
        } else {
            throw new Error('events[0] is not a hydration event');
        }
    });
});
