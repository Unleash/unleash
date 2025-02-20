import type { DeltaEvent } from './client-feature-toggle-delta-types';
import { filterEventsByQuery } from './client-feature-toggle-delta';

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
        const result = filterEventsByQuery(mockEvents, 2, ['project3'], '');
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

    test('allows all projects when * is provided', () => {
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
