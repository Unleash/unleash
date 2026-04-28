import type { DeltaEvent } from './client-feature-toggle-delta-types.js';
import { EventEmitter } from 'events';
import { register } from 'prom-client';
import {
    ClientFeatureToggleDelta,
    filterEventsByQuery,
} from './client-feature-toggle-delta.js';
import { DeltaCache } from './delta-cache.js';
import {
    FEATURE_PROJECT_CHANGE,
    SEGMENT_DELETED,
} from '../../../events/index.js';

const createLogger = () =>
    ({
        error: () => undefined,
        info: () => undefined,
        warn: () => undefined,
    }) as any;

const createDeltaConfig = () =>
    ({
        eventBus: new EventEmitter(),
        getLogger: () => createLogger(),
    }) as any;

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
            new Set([1, 2]),
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
        const result = filterEventsByQuery(
            mockEvents,
            0,
            ['*'],
            '',
            new Set([1]),
        );
        expect(result).toEqual(mockEvents);
    });

    test('filters by name prefix', () => {
        const result = filterEventsByQuery(
            mockEvents,
            0,
            ['project1', 'project2'],
            'alpha',
            new Set([1, 2]),
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
        const referencedSegmentIds = new Set([1, 2]);
        const result = filterEventsByQuery(
            mockEvents,
            0,
            ['project3'],
            'beta',
            referencedSegmentIds,
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
            // we propagate segment removed. Once dereferenced removing them should save memory
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
    test('segment-created alone does not advance visible revision for an environment where it is unused', async () => {
        let currentRevisionId = 1;
        const delta = new ClientFeatureToggleDelta(
            {
                getAll: async ({
                    environment,
                    toggleNames = [],
                }: {
                    environment: string;
                    toggleNames?: string[];
                }) => {
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

                    return toggleNames.includes('first')
                        ? [developmentFeature]
                        : [];
                },
            } as any,
            {
                getAllForClientIds: async (ids?: number[]) =>
                    ids?.includes(101)
                        ? [{ id: 101, name: 'segment-a', constraints: [] }]
                        : [],
            } as any,
            {
                getDeltaRevisionState: async () => ({
                    projectRevisions: new Map([['default', 1]]),
                    maxReferencedSegmentRevision: 0,
                    segmentRevisions: new Map(),
                }),
                getRevisionRange: async () => [
                    {
                        id: 2,
                        type: 'segment-created',
                        data: { id: 101, name: 'segment-a' },
                        createdAt: new Date(),
                    },
                ],
                getMaxRevisionId: async () => currentRevisionId,
            } as any,
            {
                on: () => undefined,
            } as any,
            {
                isEnabled: (name: string) => name === 'deltaApi',
            } as any,
            createDeltaConfig(),
        );

        const baseline = await delta.getDelta(undefined, {
            environment: 'development',
            project: ['default'],
        } as any);

        currentRevisionId = 2;
        await delta.onUpdateRevisionEvent();

        const result = await delta.getDelta(1, {
            environment: 'development',
            project: ['default'],
        } as any);

        expect(baseline?.events[0]?.eventId).toBe(1);
        expect(result).toBeUndefined();
    });

    test('segment-created followed by unrelated environment change does not advance visible revision and hydration stays in parity', async () => {
        const currentRevisionId = 1;
        const createReadModel = () =>
            ({
                getAll: async ({
                    environment,
                    toggleNames = [],
                }: {
                    environment: string;
                    toggleNames?: string[];
                }) => {
                    const featureByEnvironment = {
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
                        featureByEnvironment[
                            environment as keyof typeof featureByEnvironment
                        ];

                    if (!feature) {
                        return [];
                    }

                    if (toggleNames.length === 0) {
                        return [feature];
                    }

                    return toggleNames.includes('first') ? [feature] : [];
                },
            }) as any;
        const createSegmentModel = () =>
            ({
                getAllForClientIds: async (ids?: number[]) =>
                    ids?.includes(101)
                        ? [{ id: 101, name: 'segment-a', constraints: [] }]
                        : [],
            }) as any;
        const createEventStore = () =>
            ({
                getDeltaRevisionState: async () => ({
                    projectRevisions: new Map([['default', 1]]),
                    maxReferencedSegmentRevision: 0,
                    segmentRevisions: new Map(),
                }),
                getRevisionRange: async () => [
                    {
                        id: 2,
                        type: 'segment-created',
                        data: { id: 101, name: 'segment-a' },
                        createdAt: new Date(),
                    },
                    {
                        id: 3,
                        type: 'feature-updated',
                        featureName: 'first',
                        project: 'default',
                        environment: 'production',
                    },
                ],
                getMaxRevisionId: async () => currentRevisionId,
            }) as any;

        const liveDelta = new ClientFeatureToggleDelta(
            createReadModel(),
            createSegmentModel(),
            createEventStore(),
            {
                on: () => undefined,
            } as any,
            {
                isEnabled: (name: string) => name === 'deltaApi',
            } as any,
            createDeltaConfig(),
        );

        const initialHydration = await liveDelta.getDelta(undefined, {
            environment: 'development',
            project: ['default'],
        } as any);
        expect(initialHydration?.events[0]?.eventId).toBe(1);

        await liveDelta.onUpdateRevisionEvent();

        const liveResult = await liveDelta.getDelta(1, {
            environment: 'development',
            project: ['default'],
        } as any);
        expect(liveResult).toBeUndefined();

        const freshDelta = new ClientFeatureToggleDelta(
            createReadModel(),
            createSegmentModel(),
            createEventStore(),
            {
                on: () => undefined,
            } as any,
            {} as any,
            createDeltaConfig(),
        );

        const freshHydration = await freshDelta.getDelta(undefined, {
            environment: 'development',
            project: ['default'],
        } as any);

        expect(freshHydration?.events[0]?.eventId).toBe(1);
    });

    test('segment-updated only advances visible revision when the segment is referenced by a visible feature', async () => {
        let currentRevisionId = 1;

        const createEventStore = () =>
            ({
                getDeltaRevisionState: async () => ({
                    projectRevisions: new Map([['default', 1]]),
                    maxReferencedSegmentRevision: 1,
                    segmentRevisions: new Map(),
                }),
                getRevisionRange: async () => [
                    {
                        id: 2,
                        type: 'segment-updated',
                        data: { id: 101, name: 'segment-a' },
                        createdAt: new Date(),
                    },
                ],
                getMaxRevisionId: async () => currentRevisionId,
            }) as any;

        const createSegmentModel = () =>
            ({
                getAllForClientIds: async (ids?: number[]) =>
                    ids?.includes(101)
                        ? [{ id: 101, name: 'segment-a', constraints: [] }]
                        : [],
            }) as any;

        const unreferencedSegment = new ClientFeatureToggleDelta(
            {
                getAll: async () => [
                    {
                        name: 'first',
                        project: 'default',
                        enabled: false,
                    },
                ],
            } as any,
            createSegmentModel(),
            createEventStore(),
            {
                on: () => undefined,
            } as any,
            {
                isEnabled: (name: string) => name === 'deltaApi',
            } as any,
            createDeltaConfig(),
        );

        await unreferencedSegment.getDelta(undefined, {
            environment: 'development',
            project: ['default'],
        } as any);

        currentRevisionId = 2;
        await unreferencedSegment.onUpdateRevisionEvent();

        const unusedResult = await unreferencedSegment.getDelta(1, {
            environment: 'development',
            project: ['default'],
        } as any);
        expect(unusedResult).toBeUndefined();

        const usedDelta = new ClientFeatureToggleDelta(
            {
                getAll: async () => [
                    {
                        name: 'first',
                        project: 'default',
                        enabled: false,
                        strategies: [{ name: 'default', segments: [101] }],
                    },
                ],
            } as any,
            createSegmentModel(),
            createEventStore(),
            {
                on: () => undefined,
            } as any,
            {
                isEnabled: (name: string) => name === 'deltaApi',
            } as any,
            createDeltaConfig(),
        );

        await usedDelta.getDelta(undefined, {
            environment: 'development',
            project: ['default'],
        } as any);

        currentRevisionId = 2;
        await usedDelta.onUpdateRevisionEvent();

        const usedResult = await usedDelta.getDelta(1, {
            environment: 'development',
            project: ['default'],
        } as any);

        expect(usedResult).toEqual({
            events: [
                {
                    eventId: 2,
                    type: 'segment-updated',
                    segment: { id: 101, name: 'segment-a', constraints: [] },
                },
            ],
        });
    });

    test('segment-removed is delivered with the feature update that dereferences it', async () => {
        let currentRevisionId = 1;
        let featureReferencesSegment = true;

        const delta = new ClientFeatureToggleDelta(
            {
                getAll: async () => [
                    {
                        name: 'first',
                        project: 'default',
                        enabled: false,
                        strategies: [
                            featureReferencesSegment
                                ? { name: 'default', segments: [101] }
                                : { name: 'default' },
                        ],
                    },
                ],
            } as any,
            {
                getAllForClientIds: async (ids?: number[]) =>
                    ids === undefined || ids.includes(101)
                        ? [{ id: 101, name: 'segment-a', constraints: [] }]
                        : [],
            } as any,
            {
                getDeltaRevisionState: async () => ({
                    projectRevisions: new Map([['default', 1]]),
                    maxReferencedSegmentRevision: 1,
                    segmentRevisions: new Map([[101, 1]]),
                }),
                getRevisionRange: async () => [
                    {
                        id: 2,
                        type: 'feature-updated',
                        featureName: 'first',
                        project: 'default',
                        environment: 'development',
                        createdAt: new Date(),
                    },
                    {
                        id: 3,
                        type: SEGMENT_DELETED,
                        preData: { id: 101, name: 'segment-a' },
                        createdAt: new Date(),
                    },
                ],
                getMaxRevisionId: async () => currentRevisionId,
            } as any,
            {
                on: () => undefined,
            } as any,
            {
                isEnabled: (name: string) => name === 'deltaApi',
            } as any,
            createDeltaConfig(),
        );

        await delta.getDelta(undefined, {
            environment: 'development',
            project: ['default'],
        } as any);

        featureReferencesSegment = false;
        currentRevisionId = 3;
        await delta.onUpdateRevisionEvent();

        const result = await delta.getDelta(1, {
            environment: 'development',
            project: ['default'],
        } as any);

        expect(result).toEqual({
            events: [
                {
                    eventId: 2,
                    type: 'feature-updated',
                    feature: {
                        name: 'first',
                        project: 'default',
                        enabled: false,
                        strategies: [{ name: 'default' }],
                    },
                },
                {
                    eventId: 3,
                    type: 'segment-removed',
                    segmentId: 101,
                },
            ],
        });
    });

    test('returns segment payload when a feature newly references a previously hidden segment update', async () => {
        let currentRevisionId = 7;

        const eventStore = {
            getDeltaRevisionState: async () => ({
                projectRevisions: new Map([['default', 7]]),
                maxReferencedSegmentRevision: 7,
                segmentRevisions: new Map(),
            }),
            getRevisionRange: async (from: number, to: number) => {
                if (from === 7 && to === 14) {
                    return [
                        {
                            id: 12,
                            type: 'segment-updated',
                            data: { id: 1, name: 'segment-a' },
                            createdAt: new Date(),
                        },
                        {
                            id: 14,
                            type: 'feature-updated',
                            featureName: 'test-flag',
                            project: 'default',
                            environment: 'development',
                            data: { name: 'test-flag', enabled: true },
                            createdAt: new Date(),
                        },
                    ];
                }

                return [
                    {
                        id: 15,
                        type: 'feature-updated',
                        featureName: 'test-flag',
                        project: 'default',
                        environment: 'development',
                        data: { name: 'test-flag', enabled: true },
                        createdAt: new Date(),
                    },
                ];
            },
            getMaxRevisionId: async () => currentRevisionId,
        } as any;

        const readModel = {
            getAll: async ({
                toggleNames = [],
            }: {
                toggleNames?: string[];
            }) => {
                if (
                    toggleNames.includes('test-flag') &&
                    currentRevisionId >= 15
                ) {
                    return [
                        {
                            name: 'test-flag',
                            project: 'default',
                            enabled: true,
                            strategies: [{ name: 'default', segments: [1] }],
                        },
                    ];
                }

                return [
                    {
                        name: 'test-flag',
                        project: 'default',
                        enabled: true,
                        strategies: [{ name: 'default' }],
                    },
                ];
            },
        } as any;

        const segmentReadModel = {
            getAllForClientIds: async (ids?: number[]) =>
                ids?.includes(1)
                    ? [{ id: 1, name: 'segment-a', constraints: [] }]
                    : [],
        } as any;

        const delta = new ClientFeatureToggleDelta(
            readModel,
            segmentReadModel,
            eventStore,
            {
                on: () => undefined,
            } as any,
            {
                isEnabled: (name: string) => name === 'deltaApi',
            } as any,
            createDeltaConfig(),
        );

        const hydration = await delta.getDelta(undefined, {
            environment: 'development',
            project: ['default'],
        } as any);
        expect(hydration?.events[0]?.eventId).toBe(7);

        currentRevisionId = 14;
        await delta.onUpdateRevisionEvent();

        const unrelatedUpdate = await delta.getDelta(7, {
            environment: 'development',
            project: ['default'],
        } as any);
        expect(unrelatedUpdate).toEqual({
            events: [
                {
                    eventId: 14,
                    type: 'feature-updated',
                    feature: {
                        name: 'test-flag',
                        project: 'default',
                        enabled: true,
                        strategies: [{ name: 'default' }],
                    },
                },
            ],
        });

        currentRevisionId = 15;
        await delta.onUpdateRevisionEvent();

        const newlyReferencedSegment = await delta.getDelta(14, {
            environment: 'development',
            project: ['default'],
        } as any);
        expect(newlyReferencedSegment).toEqual({
            events: [
                {
                    eventId: 15,
                    type: 'segment-updated',
                    segment: { id: 1, name: 'segment-a', constraints: [] },
                },
                {
                    eventId: 15,
                    type: 'feature-updated',
                    feature: {
                        name: 'test-flag',
                        project: 'default',
                        enabled: true,
                        strategies: [{ name: 'default', segments: [1] }],
                    },
                },
            ],
        });
    });

    test('materializes delta_environment_revision_id on first hydration request', async () => {
        const environment = 'metric-materialization-test';
        const delta = new ClientFeatureToggleDelta(
            {
                getAll: async () => [
                    {
                        name: 'first',
                        project: 'default',
                        enabled: false,
                    },
                ],
            } as any,
            {
                getAllForClientIds: async () => [],
            } as any,
            {
                getDeltaRevisionState: async () => ({
                    projectRevisions: new Map([['default', 7]]),
                    maxReferencedSegmentRevision: 0,
                    segmentRevisions: new Map(),
                }),
                getMaxRevisionId: async () => 7,
            } as any,
            {
                on: () => undefined,
            } as any,
            {} as any,
            createDeltaConfig(),
        );

        const result = await delta.getDelta(undefined, {
            environment,
            project: ['default'],
        } as any);
        const metrics = await register.metrics();

        expect(result?.events[0]?.eventId).toBe(7);
        expect(metrics).toMatch(
            new RegExp(
                `delta_environment_revision_id\\{environment="${environment}"\\} 7`,
            ),
        );
    });

    test('returns the same wildcard hydration revision for identical environment state across pods', async () => {
        const createDelta = (globalRevisionId: number) =>
            new ClientFeatureToggleDelta(
                {
                    getAll: async ({
                        environment,
                    }: {
                        environment?: string;
                    }) =>
                        environment === 'production'
                            ? [
                                  {
                                      name: 'first',
                                      project: 'default',
                                      enabled: true,
                                  },
                              ]
                            : [],
                } as any,
                {
                    getAllForClientIds: async () => [],
                } as any,
                {
                    getDeltaRevisionState: async () => ({
                        projectRevisions: new Map([['default', 85815]]),
                        maxReferencedSegmentRevision: 0,
                        segmentRevisions: new Map(),
                    }),
                    getMaxRevisionId: async () => globalRevisionId,
                } as any,
                {
                    on: () => undefined,
                } as any,
                {} as any,
                {
                    eventBus: new EventEmitter(),
                    getLogger: () =>
                        ({
                            error: () => undefined,
                            info: () => undefined,
                        }) as any,
                } as any,
            );

        const stalePodDelta = createDelta(85815);
        const freshPodDelta = createDelta(85923);

        const stalePodResult = await stalePodDelta.getDelta(undefined, {
            environment: 'production',
            project: ['*'],
        } as any);
        const freshPodResult = await freshPodDelta.getDelta(undefined, {
            environment: 'production',
            project: ['*'],
        } as any);

        expect(stalePodResult).toBeDefined();
        expect(freshPodResult).toBeDefined();
        expect(stalePodResult?.events[0]?.eventId).toBe(
            freshPodResult?.events[0]?.eventId,
        );
    });

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
                    maxReferencedSegmentRevision: 0,
                    segmentRevisions: new Map(),
                }),
                getMaxRevisionId: async () => 0,
            } as any,
            {
                on: () => undefined,
            } as any,
            {} as any,
            {
                eventBus: new EventEmitter(),
                getLogger: () =>
                    ({
                        error: () => undefined,
                        info: () => undefined,
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
                    maxReferencedSegmentRevision: 0,
                    segmentRevisions: new Map(),
                }),
                getMaxRevisionId: async () => 0,
            } as any,
            {
                on: () => undefined,
            } as any,
            {} as any,
            {
                eventBus: new EventEmitter(),
                getLogger: () =>
                    ({
                        error: () => undefined,
                        info: () => undefined,
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
                getAll: async ({
                    environment,
                    toggleNames = [],
                }: {
                    environment: string;
                    toggleNames?: string[];
                }) => {
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
                    maxReferencedSegmentRevision: 0,
                    segmentRevisions: new Map(),
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
                getMaxRevisionId: async () => currentRevisionId,
            } as any,
            {
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
                        info: () => undefined,
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
                getAll: async ({
                    environment,
                    toggleNames = [],
                }: {
                    environment: string;
                    toggleNames?: string[];
                }) => {
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

                    return toggleNames.includes('first') ? [feature] : [];
                },
            } as any,
            {
                getAllForClientIds: async () => [],
            } as any,
            {
                getDeltaRevisionState: async () => ({
                    projectRevisions: new Map([['default', 1]]),
                    maxReferencedSegmentRevision: 0,
                    segmentRevisions: new Map(),
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
                getMaxRevisionId: async () => currentRevisionId,
            } as any,
            {
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
                        info: () => undefined,
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

    test('feature project move emits feature-removed for old project and feature-updated for new project', async () => {
        let currentRevisionId = 1;
        const delta = new ClientFeatureToggleDelta(
            {
                getAll: async ({
                    environment,
                    toggleNames = [],
                }: {
                    environment: string;
                    toggleNames?: string[];
                }) => {
                    const feature = {
                        name: 'moved-feature',
                        project: 'new-project',
                        enabled: true,
                    };

                    if (environment !== 'development') return [];
                    if (toggleNames.length === 0) return [feature];
                    return toggleNames.includes('moved-feature')
                        ? [feature]
                        : [];
                },
            } as any,
            {
                getAllForClientIds: async () => [],
            } as any,
            {
                getDeltaRevisionState: async () => ({
                    projectRevisions: new Map([['old-project', 1]]),
                    maxReferencedSegmentRevision: 0,
                    segmentRevisions: new Map(),
                }),
                getRevisionRange: async () => [
                    {
                        id: 2,
                        type: FEATURE_PROJECT_CHANGE,
                        featureName: 'moved-feature',
                        project: 'new-project',
                        environment: null,
                        data: {
                            oldProject: 'old-project',
                            newProject: 'new-project',
                        },
                    },
                ],
                getMaxRevisionId: async () => currentRevisionId,
            } as any,
            {
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
                        info: () => undefined,
                    }) as any,
            } as any,
        );

        await delta.getDelta(undefined, {
            environment: 'development',
            project: ['*'],
        } as any);

        currentRevisionId = 2;
        await delta.onUpdateRevisionEvent();

        const oldProjectResult = await delta.getDelta(1, {
            environment: 'development',
            project: ['old-project'],
        } as any);

        const newProjectResult = await delta.getDelta(1, {
            environment: 'development',
            project: ['new-project'],
        } as any);

        const bothProjectsResult = await delta.getDelta(1, {
            environment: 'development',
            project: ['old-project', 'new-project'],
        } as any);

        expect(oldProjectResult).toEqual({
            events: [
                {
                    eventId: 2,
                    type: 'feature-removed',
                    featureName: 'moved-feature',
                    project: 'old-project',
                },
            ],
        });

        expect(newProjectResult).toEqual({
            events: [
                {
                    eventId: 2,
                    type: 'feature-updated',
                    feature: {
                        name: 'moved-feature',
                        project: 'new-project',
                        enabled: true,
                    },
                },
            ],
        });

        expect(bothProjectsResult).toEqual({
            events: [
                {
                    eventId: 2,
                    type: 'feature-removed',
                    featureName: 'moved-feature',
                    project: 'old-project',
                },
                {
                    eventId: 2,
                    type: 'feature-updated',
                    feature: {
                        name: 'moved-feature',
                        project: 'new-project',
                        enabled: true,
                    },
                },
            ],
        });
    });

    test('bulk events pick the max revision id for the envelope', async () => {
        let currentRevisionId = 1;
        const delta = new ClientFeatureToggleDelta(
            {
                getAll: async ({
                    environment,
                    toggleNames = [],
                }: {
                    environment: string;
                    toggleNames?: string[];
                }) => {
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

                    return toggleNames.includes('first') ? [feature] : [];
                },
            } as any,
            {
                getAllForClientIds: async () => [],
            } as any,
            {
                getDeltaRevisionState: async () => ({
                    projectRevisions: new Map([['default', 1]]),
                    maxReferencedSegmentRevision: 0,
                    segmentRevisions: new Map(),
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
                getMaxRevisionId: async () => currentRevisionId,
            } as any,
            {
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
                        info: () => undefined,
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

    test('returns delta events in revision order even when cached by event type', async () => {
        let currentRevisionId = 24;

        const delta = new ClientFeatureToggleDelta(
            {
                getAll: async ({
                    toggleNames = [],
                }: {
                    toggleNames?: string[];
                }) => {
                    const feature = {
                        name: 'first',
                        project: 'default',
                        enabled: false,
                        strategies:
                            currentRevisionId >= 26
                                ? [{ name: 'default', segments: [101] }]
                                : [],
                    };

                    if (toggleNames.length === 0) {
                        return [feature];
                    }

                    return toggleNames.includes('first') ? [feature] : [];
                },
            } as any,
            {
                getAllForClientIds: async (ids?: number[]) =>
                    ids === undefined || ids.includes(101)
                        ? [{ id: 101, name: 'segment-a', constraints: [] }]
                        : [],
            } as any,
            {
                getDeltaRevisionState: async () => ({
                    projectRevisions: new Map([['default', 24]]),
                    maxReferencedSegmentRevision: 0,
                    segmentRevisions: new Map(),
                }),
                getRevisionRange: async () => [
                    {
                        id: 25,
                        type: 'segment-created',
                        data: { id: 101, name: 'segment-a' },
                        createdAt: new Date(),
                    },
                    {
                        id: 26,
                        type: 'feature-updated',
                        featureName: 'first',
                        project: 'default',
                        environment: 'development',
                        createdAt: new Date(),
                    },
                ],
                getMaxRevisionId: async () => currentRevisionId,
            } as any,
            {
                on: () => undefined,
            } as any,
            {
                isEnabled: (name: string) => name === 'deltaApi',
            } as any,
            createDeltaConfig(),
        );

        await delta.getDelta(undefined, {
            environment: 'development',
            project: ['default'],
        } as any);

        currentRevisionId = 26;
        await delta.onUpdateRevisionEvent();

        const result = await delta.getDelta(24, {
            environment: 'development',
            project: ['default'],
        } as any);

        expect(result?.events.map((event) => event.eventId)).toEqual([25, 26]);
        expect(result).toEqual({
            events: [
                {
                    eventId: 25,
                    type: 'segment-updated',
                    segment: { id: 101, name: 'segment-a', constraints: [] },
                },
                {
                    eventId: 26,
                    type: 'feature-updated',
                    feature: {
                        name: 'first',
                        project: 'default',
                        enabled: false,
                        strategies: [{ name: 'default', segments: [101] }],
                    },
                },
            ],
        });
    });
});
