import { validateSchema } from '../validate.js';
import type { ClientFeaturesQuerySchema } from './client-features-query-schema.js';

test('clientFeatureQuerySchema empty', () => {
    const data: ClientFeaturesQuerySchema = {};

    expect(
        validateSchema('#/components/schemas/clientFeaturesQuerySchema', data),
    ).toBeUndefined();
});

test('clientFeatureQuerySchema all fields', () => {
    const data: ClientFeaturesQuerySchema = {
        tag: [['some-tag', 'some-other-tag']],
        project: ['default'],
        namePrefix: 'some-prefix',
        environment: 'some-env',
        inlineSegmentConstraints: true,
    };

    expect(
        validateSchema('#/components/schemas/clientFeaturesQuerySchema', data),
    ).toBeUndefined();
});
