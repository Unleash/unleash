import { validateSchema } from '../validate';
import { FeatureMetricsSchema } from './feature-metrics-schema';

test('featureMetricsSchema', () => {
    const data: FeatureMetricsSchema = {
        maturity: 'stable',
        version: 2,
        data: [
            {
                environment: 'some-env',
                timestamp: new Date().toISOString(),
                yes: 50,
                no: 1,
            },
        ],
    };

    expect(
        validateSchema('#/components/schemas/featureMetricsSchema', data),
    ).toBeUndefined();
});

test('featureTypeSchema empty', () => {
    expect(
        validateSchema('#/components/schemas/featureMetricsSchema', {}),
    ).toMatchSnapshot();
});
