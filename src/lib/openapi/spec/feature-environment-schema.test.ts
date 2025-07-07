import { validateSchema } from '../validate.js';
import type { FeatureEnvironmentSchema } from './feature-environment-schema.js';

test('featureEnvironmentSchema', () => {
    const data: FeatureEnvironmentSchema = {
        name: '',
        enabled: true,
        strategies: [
            {
                id: '',
                name: '',
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
