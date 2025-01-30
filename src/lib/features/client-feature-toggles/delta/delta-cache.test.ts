import { DeltaCache } from './delta-cache';
import {
    DELTA_EVENT_TYPES,
    type DeltaEvent,
    type DeltaHydrationEvent,
} from './client-feature-toggle-delta-types';

describe('RevisionCache', () => {
    it('should always update the hydration event and remove event when over limit', () => {
        const baseEvent: DeltaHydrationEvent = {
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
            segments: [
                {
                    id: 1,
                    name: 'update-segment',
                    constraints: [],
                },
                {
                    id: 2,
                    name: 'remove-segment',
                    constraints: [],
                },
            ],
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
                type: DELTA_EVENT_TYPES.FEATURE_UPDATED,
            },
        ];

        const maxLength = 2;
        const deltaCache = new DeltaCache(baseEvent, maxLength);
        deltaCache.addEvents(initialEvents);

        // Add a new revision to trigger changeBase
        const addedEvents: DeltaEvent[] = [
            {
                eventId: 3,
                type: DELTA_EVENT_TYPES.FEATURE_UPDATED,
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
            {
                eventId: 5,
                type: 'segment-updated',
                segment: {
                    id: 1,
                    name: 'update-segment-new',
                    constraints: [],
                },
            },
            {
                eventId: 6,
                type: 'segment-removed',
                segmentId: 2,
            },
            {
                eventId: 7,
                type: 'segment-updated',
                segment: {
                    id: 3,
                    name: 'new-segment',
                    constraints: [],
                },
            },
        ];
        deltaCache.addEvents(addedEvents);

        const events = deltaCache.getEvents();

        // Check that the base has been changed and merged correctly
        expect(events.length).toBe(maxLength);
        expect(events).toEqual(addedEvents.slice(-2));

        const hydrationEvent = deltaCache.getHydrationEvent();
        expect(hydrationEvent.features).toHaveLength(2);
        expect(hydrationEvent.features).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: 'my-feature-flag' }),
                expect.objectContaining({ name: 'another-feature-flag' }),
            ]),
        );
        expect(hydrationEvent.segments).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: 'update-segment-new', id: 1 }),
                expect.objectContaining({ name: 'new-segment' }),
            ]),
        );
    });
});
