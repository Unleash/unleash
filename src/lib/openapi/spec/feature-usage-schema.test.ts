import { validateSchema } from '../validate.js';
import type { FeatureUsageSchema } from './feature-usage-schema.js';

test('featureUsageSchema', () => {
    const data: FeatureUsageSchema = {
        featureName: 'some-name',
        version: 2,
        lastHourUsage: [
            {
                environment: 'some-env',
                yes: 50,
                no: 32,
                timestamp: new Date(2020, 6, 1, 17, 50, 3).toISOString(),
            },
        ],
        totalUsage: [
            {
                environment: 'some-env',
                yes: 5000,
                no: 3200,
            },
        ],
        maturity: 'stable',
        seenApplications: [],
    };

    expect(
        validateSchema('#/components/schemas/featureUsageSchema', data),
    ).toBeUndefined();
});
