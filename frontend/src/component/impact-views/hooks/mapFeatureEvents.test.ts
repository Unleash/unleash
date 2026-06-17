import { describe, expect, it } from 'vitest';
import type { EventSchema } from 'openapi';
import { mapFeatureEvents } from './mapFeatureEvents';

const apiEvent = (overrides: Partial<EventSchema> = {}): EventSchema =>
    ({
        id: 1,
        type: 'feature-environment-enabled',
        createdAt: '2026-06-17T10:00:00.000Z',
        createdBy: 'someone',
        label: 'Enabled',
        featureName: 'my-flag',
        ...overrides,
    }) as EventSchema;

describe('mapFeatureEvents', () => {
    it('maps schema fields and converts createdAt to ms', () => {
        const [mapped] = mapFeatureEvents([apiEvent()], 'production');
        expect(mapped).toEqual({
            id: 1,
            timestamp: new Date('2026-06-17T10:00:00.000Z').getTime(),
            type: 'feature-environment-enabled',
            label: 'Enabled',
            createdBy: 'someone',
            featureName: 'my-flag',
            environment: 'production',
        });
    });

    it('falls back to the type for a missing label and "" for a missing feature', () => {
        const [mapped] = mapFeatureEvents(
            [apiEvent({ label: null, featureName: null })],
            'development',
        );
        expect(mapped.label).toBe('feature-environment-enabled');
        expect(mapped.featureName).toBe('');
        expect(mapped.environment).toBe('development');
    });
});
