import type { DeltaEvent } from './client-feature-toggle-delta-types.js';
import { EventEmitter } from 'events';
import {
    ClientFeatureToggleDelta,
    filterEventsByQuery,
} from './client-feature-toggle-delta.js';
import { DeltaCache } from './delta-cache.js';

describe('filterEventsByQuery', () => {
    const mockEvents: DeltaEvent[] = [
        {
            eventId: 1,
            type: 'feature-updated',
            feature: {
                name: 'test-feature',
                project: 'project1',
                enabled: true,
            },
        },
        {
            eventId: 2,
            type: 'feature-updated',
            feature: {
                name: 'alpha-feature',
                project: 'project2',
                enabled: true,
            },
        },
        {
            eventId: 3,
            type: 'feature-removed',
            featureName: 'beta-feature',
            project: 'project3',
        },
        {
            eventId: 4,
            type: 'segment-updated',
            segment: { id: 1, name: 'my-segment', constraints: [] },
        },
        { eventId: 5, type: 'segment-removed', segmentId: 2 },
    ];
    test('filters events based on eventId', () => {
        const requiredRevisionId = 2;
        const result = filterEventsByQuery(
            mockEvents,
            requiredRevisionId,
            ['project3'],
            '',
        );
        expect(result).toEqual([
            {
                eventId: 3,
                type: 'feature-removed',
                featureName: 'beta-feature',
                project: 'project3',
            },
            {
                eventId: 4,
                type: 'segment-updated',
                segment: { id: 1, name: 'my-segment', constraints: [] },
            },
            { eventId: 5, type: 'segment-removed', segmentId: 2 },
        ]);
    });

    test('returns all projects', () => {
        const result = filterEventsByQuery(mockEvents, 0, ['*'], '');
        expect(result).toEqual(mockEvents);
    });

    test('filters by name prefix', () => {
        const result = filterEventsByQuery(
            mockEvents,
            0,
            ['project1', 'project2'],
            'alpha',
        );
        expect(result).toEqual([
            {
                eventId: 2,
                type: 'feature-updated',
                feature: {
                    name: 'alpha-feature',
                    project: 'project2',
                    enabled: true,
                },
            },
            {
                eventId: 4,
                type: 'segment-updated',
                segment: { id: 1, name: 'my-segment', constraints: [] },
            },
            { eventId: 5, type: 'segment-removed', segmentId: 2 },
        ]);
    });

    test('filters by project list', () => {
        const result = filterEventsByQuery(mockEvents, 0, ['project3'], 'beta');
        expect(result).toEqual([
            {
                eventId: 3,
                type: 'feature-removed',
                featureName: 'beta-feature',
                project: 'project3',
            },
            {
                eventId: 4,
                type: 'segment-updated',
                segment: { id: 1, name: 'my-segment', constraints: [] },
            },
            { eventId: 5, type: 'segment-removed', segmentId: 2 },
        ]);
    });
});

describe('DeltaCache hydration ordering', () => {
    test('keeps hydration features sorted after updates', () => {
        const cache = new DeltaCache({
            eventId: 1,
            type: 'hydration',
            features: [
                { name: 'bravo', enabled: true },
                { name: 'charlie', enabled: true },
            ],
            segments: [{ id: 2, name: 'segment-b', constraints: [] }],
        });

        cache.addEvents([
            {
                eventId: 2,
                type: 'feature-updated',
                feature: { name: 'alpha', enabled: true },
            },
        ]);

        const hydration = cache.getHydrationEvent();
        expect(hydration.features.map((feature) => feature.name)).toEqual([
            'alpha',
            'bravo',
            'charlie',
        ]);
    });

    test('keeps hydration segments sorted after updates', () => {
        const cache = new DeltaCache({
            eventId: 1,
            type: 'hydration',
            features: [{ name: 'alpha', enabled: true }],
            segments: [
                { id: 3, name: 'segment-c', constraints: [] },
                { id: 4, name: 'segment-d', constraints: [] },
            ],
        });

        cache.addEvents([
            {
                eventId: 2,
                type: 'segment-updated',
                segment: { id: 2, name: 'segment-b', constraints: [] },
            },
            {
                eventId: 3,
                type: 'segment-updated',
                segment: { id: 1, name: 'segment-b', constraints: [] },
            },
        ]);

        const hydration = cache.getHydrationEvent();
        expect(hydration.segments.map((segment) => segment.id)).toEqual([
            1, 2, 3, 4,
        ]);
    });
});

describe('ClientFeatureToggleDelta bootstrap behavior', () => {
    test('returns an empty hydration event on initial request for an empty environment', async () => {
        const delta = new ClientFeatureToggleDelta(
            {
                getAll: async () => [],
            } as any,
            {
                getAllForClientIds: async () => [],
            } as any,
            {
                getDeltaRevisionState: async () => ({
                    projectRevisions: new Map(),
                    globalSegmentRevision: 0,
                }),
            } as any,
            {
                getMaxRevisionId: async () => 0,
                on: () => undefined,
            } as any,
            {} as any,
            {
                eventBus: new EventEmitter(),
                getLogger: () =>
                    ({
                        error: () => undefined,
                    }) as any,
            } as any,
        );

        const result = await delta.getDelta(undefined, {
            environment: 'production',
        } as any);

        expect(result).toEqual({
            events: [
                {
                    eventId: 0,
                    type: 'hydration',
                    features: [],
                    segments: [],
                },
            ],
        });
    });

    test('returns no delta when client explicitly requests revision 0 for an empty environment', async () => {
        const delta = new ClientFeatureToggleDelta(
            {
                getAll: async () => [],
            } as any,
            {
                getAllForClientIds: async () => [],
            } as any,
            {
                getDeltaRevisionState: async () => ({
                    projectRevisions: new Map(),
                    globalSegmentRevision: 0,
                }),
            } as any,
            {
                getMaxRevisionId: async () => 0,
                on: () => undefined,
            } as any,
            {} as any,
            {
                eventBus: new EventEmitter(),
                getLogger: () =>
                    ({
                        error: () => undefined,
                    }) as any,
            } as any,
        );

        const result = await delta.getDelta(0, {
            environment: 'production',
        } as any);

        expect(result).toBeUndefined();
    });

    test('does not emit a no-op delta for an unrelated environment change', async () => {
        let currentRevisionId = 1;
        const delta = new ClientFeatureToggleDelta(
            {
                getAll: async ({ environment, toggleNames = [] }) => {
                    const developmentFeature = {
                        name: 'first',
                        project: 'default',
                        enabled: false,
                    };

                    if (environment !== 'development') {
                        return [];
                    }

                    if (toggleNames.length === 0) {
                        return [developmentFeature];
                    }

                    // @ts-expect-error - toggle name not defined
                    return toggleNames.includes('first')
                        ? [developmentFeature]
                        : [];
                },
            } as any,
            {
                getAllForClientIds: async () => [],
            } as any,
            {
                getDeltaRevisionState: async () => ({
                    projectRevisions: new Map([['default', 1]]),
                    globalSegmentRevision: 0,
                }),
                getRevisionRange: async () => [
                    {
                        id: 2,
                        type: 'feature-updated',
                        featureName: 'first',
                        project: 'default',
                        environment: 'production',
                    },
                ],
            } as any,
            {
                getMaxRevisionId: async () => currentRevisionId,
                on: () => undefined,
            } as any,
            {
                isEnabled: (name: string) => name === 'deltaApi',
            } as any,
            {
                eventBus: new EventEmitter(),
                getLogger: () =>
                    ({
                        error: () => undefined,
                    }) as any,
            } as any,
        );

        await delta.getDelta(undefined, {
            environment: 'development',
            project: ['default'],
        } as any);

        currentRevisionId = 2;
        await delta.onUpdateRevisionEvent();

        const result = await delta.getDelta(1, {
            environment: 'development',
            project: ['default'],
        } as any);

        expect(result).toBeUndefined();
    });

    test('applies global events without environment to all initialized environments', async () => {
        let currentRevisionId = 1;
        const delta = new ClientFeatureToggleDelta(
            {
                getAll: async ({ environment, toggleNames = [] }) => {
                    const featuresByEnvironment = {
                        development: {
                            name: 'first',
                            project: 'default',
                            enabled: false,
                        },
                        production: {
                            name: 'first',
                            project: 'default',
                            enabled: true,
                        },
                    };

                    const feature =
                        featuresByEnvironment[
                            environment as keyof typeof featuresByEnvironment
                        ];

                    if (!feature) {
                        return [];
                    }

                    if (toggleNames.length === 0) {
                        return [feature];
                    }

                    // @ts-expect-error - toggle name not defined
                    return toggleNames.includes('first') ? [feature] : [];
                },
            } as any,
            {
                getAllForClientIds: async () => [],
            } as any,
            {
                getDeltaRevisionState: async () => ({
                    projectRevisions: new Map([['default', 1]]),
                    globalSegmentRevision: 0,
                }),
                getRevisionRange: async () => [
                    {
                        id: 2,
                        type: 'feature-updated',
                        featureName: 'first',
                        project: 'default',
                        environment: null,
                    },
                ],
            } as any,
            {
                getMaxRevisionId: async () => currentRevisionId,
                on: () => undefined,
            } as any,
            {
                isEnabled: (name: string) => name === 'deltaApi',
            } as any,
            {
                eventBus: new EventEmitter(),
                getLogger: () =>
                    ({
                        error: () => undefined,
                    }) as any,
            } as any,
        );

        await delta.getDelta(undefined, {
            environment: 'development',
            project: ['default'],
        } as any);
        await delta.getDelta(undefined, {
            environment: 'production',
            project: ['default'],
        } as any);

        currentRevisionId = 2;
        await delta.onUpdateRevisionEvent();

        const developmentResult = await delta.getDelta(1, {
            environment: 'development',
            project: ['default'],
        } as any);
        const productionResult = await delta.getDelta(1, {
            environment: 'production',
            project: ['default'],
        } as any);

        expect(developmentResult).toEqual({
            events: [
                {
                    eventId: 2,
                    type: 'feature-updated',
                    feature: {
                        name: 'first',
                        project: 'default',
                        enabled: false,
                    },
                },
            ],
        });
        expect(productionResult).toEqual({
            events: [
                {
                    eventId: 2,
                    type: 'feature-updated',
                    feature: {
                        name: 'first',
                        project: 'default',
                        enabled: true,
                    },
                },
            ],
        });
    });
});
