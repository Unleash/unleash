import type { DeltaEvent } from './client-feature-toggle-delta-types.js';
import { filterEventsByQuery } from './client-feature-toggle-delta.js';
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
