import { validateSchema } from '../validate';
import type { ClientFeaturesDeltaSchema } from './client-features-delta-schema';

test('clientFeaturesDeltaSchema all fields', () => {
    const data: ClientFeaturesDeltaSchema = {
        events: [
            {
                eventId: 1,
                type: 'feature-removed',
                featureName: 'removed-event',
            },
            {
                eventId: 1,
                type: 'feature-updated',
                feature: {
                    impressionData: false,
                    enabled: false,
                    name: 'base_feature',
                    description: null,
                    project: 'default',
                    stale: false,
                    type: 'release',
                    variants: [],
                    strategies: [],
                },
            },
            {
                eventId: 1,
                type: 'segment-removed',
                segmentId: 33,
            },
            {
                eventId: 1,
                type: 'segment-updated',
                segment: {
                    id: 3,
                    name: 'hello',
                    constraints: [],
                },
            },
        ],
    };

    expect(
        validateSchema('#/components/schemas/clientFeaturesDeltaSchema', data),
    ).toBeUndefined();
});
