import { validateSchema } from '../validate';
import { FeatureEnvironmentSchema } from './feature-environment-schema';

test('featureEnvironmentSchema', () => {
    const data: FeatureEnvironmentSchema = {
        name: '',
        enabled: true,
        strategies: [
            {
                id: '',
                featureName: '',
                projectId: '',
                environment: '',
                strategyName: '',
                constraints: [{ contextName: '', operator: 'IN' }],
                parameters: { a: '' },
            },
        ],
    };

    expect(
        validateSchema('#/components/schemas/featureEnvironmentSchema', data),
    ).toBeUndefined();
});

test('featureEnvironmentSchema empty', () => {
    expect(
        validateSchema('#/components/schemas/featureEnvironmentSchema', {}),
    ).toMatchSnapshot();
});
