import { validateSchema } from '../validate';
import { AdminFeaturesQuerySchema } from './admin-features-query-schema';

test('adminFeaturesQuerySchema empty', () => {
    const data: AdminFeaturesQuerySchema = {};

    expect(
        validateSchema('#/components/schemas/adminFeaturesQuerySchema', data),
    ).toBeUndefined();
});

test('adminFeatureQuerySchema all fields', () => {
    const data: AdminFeaturesQuerySchema = {
        tag: ['simple:some-tag', 'simple:some-other-tag'],
        namePrefix: 'some-prefix',
    };

    expect(
        validateSchema('#/components/schemas/adminFeaturesQuerySchema', data),
    ).toBeUndefined();
});

test('pattern validation should deny invalid tags', () => {
    const data: AdminFeaturesQuerySchema = {
        tag: ['something', 'somethingelse'],
    };

    expect(
        validateSchema('#/components/schemas/adminFeaturesQuerySchema', data),
    ).toBeDefined();
});
