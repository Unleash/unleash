import { DeltaCache } from './delta-cache.js';
import {
    DELTA_EVENT_TYPES,
    type DeltaEvent,
    type DeltaHydrationEvent,
} from './client-feature-toggle-delta-types.js';

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
                type: DELTA_EVENT_TYPES.FEATURE_REMOVED,
                featureName: 'test-flag',
                project: 'default',
            },
            {
                eventId: 5,
                type: DELTA_EVENT_TYPES.SEGMENT_UPDATED,
                segment: {
                    id: 1,
                    name: 'update-segment-new',
                    constraints: [],
                },
            },
            {
                eventId: 6,
                type: DELTA_EVENT_TYPES.SEGMENT_REMOVED,
                segmentId: 2,
            },
            {
                eventId: 7,
                type: DELTA_EVENT_TYPES.SEGMENT_UPDATED,
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
        expect(hydrationEvent.eventId).toEqual(7);
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

    it('should not mutate previous feature-updated events when new events with the same feature name are added', () => {
        const baseEvent: DeltaHydrationEvent = {
            eventId: 1,
            features: [
                {
                    name: 'base-flag',
                    type: 'release',
                    enabled: true,
                    project: 'streaming-deltas',
                    stale: false,
                    strategies: [],
                    variants: [],
                    description: null,
                    impressionData: false,
                },
            ],
            type: 'hydration',
            segments: [],
        };

        const deltaCache = new DeltaCache(baseEvent, 10);

        const initialFeatureEvent: DeltaEvent = {
            eventId: 129,
            type: DELTA_EVENT_TYPES.FEATURE_UPDATED,
            feature: {
                impressionData: false,
                enabled: false,
                name: 'streaming-test',
                description: null,
                project: 'streaming-deltas',
                stale: false,
                type: 'release',
                variants: [],
                strategies: [],
            },
        };
        // This tests is to verify that the initialFeatureEvent is not mutated when a new event with the same feature name is added
        // the following dirty way to clone this object is to avoid mutation on the comparison object. Because the object is passed by reference
        // we would be comparing the same object with itself which would cause the expect check to always pass because the comparison would
        // also change to match the object being compared.
        deltaCache.addEvents([JSON.parse(JSON.stringify(initialFeatureEvent))]);

        const updatedFeatureEvent: DeltaEvent = {
            eventId: 130,
            type: DELTA_EVENT_TYPES.FEATURE_UPDATED,
            feature: {
                impressionData: false,
                enabled: true,
                name: 'streaming-test',
                description: null,
                project: 'streaming-deltas',
                stale: false,
                type: 'release',
                variants: [],
                strategies: [{ name: 'new-strategy', parameters: {} }],
            },
        };
        deltaCache.addEvents([updatedFeatureEvent]);
        // @ts-expect-error
        expect(deltaCache.events[1]).toStrictEqual(initialFeatureEvent);
    });
});
