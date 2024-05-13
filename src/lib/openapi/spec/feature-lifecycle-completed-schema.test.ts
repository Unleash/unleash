import { validateSchema } from '../validate';
import type { FeatureLifecycleCompletedSchema } from './feature-lifecycle-completed-schema';

test('featureLifecycleCompletedSchema', () => {
    const data: FeatureLifecycleCompletedSchema = {
        status: 'kept',
        statusValue: 'variant1',
    };

    expect(
        validateSchema(
            '#/components/schemas/featureLifecycleCompletedSchema',
            data,
        ),
    ).toBeUndefined();
});

test('featureLifecycleCompletedSchema without status', () => {
    const data: FeatureLifecycleCompletedSchema = {
        status: 'kept',
    };

    expect(
        validateSchema(
            '#/components/schemas/featureLifecycleCompletedSchema',
            data,
        ),
    ).toBeUndefined();
});
