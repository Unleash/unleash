import { validateSchema } from '../validate';
import type { ClientFeaturesDeltaSchema } from './client-features-delta-schema';

test('clientFeaturesDeltaSchema all fields', () => {
    const data: ClientFeaturesDeltaSchema = {
        revisionId: 6,
        updated: [
            {
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
        ],
        removed: [],
        segments: [],
    };

    expect(
        validateSchema('#/components/schemas/clientFeaturesDeltaSchema', data),
    ).toBeUndefined();
});
