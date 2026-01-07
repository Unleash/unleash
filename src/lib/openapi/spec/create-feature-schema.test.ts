import { validateSchema } from '../validate.js';
import type { CreateFeatureSchema } from './create-feature-schema.js';

test('createFeatureSchema', () => {
    const data: CreateFeatureSchema = {
        name: 'disable-comments',
        type: 'release',
        description:
            'Controls disabling of the comments section in case of an incident',
        impressionData: false,
        tags: [
            { type: 'simple', value: 'tag' },
            { type: 'simple', value: 'mytag' },
        ],
    };

    expect(
        validateSchema('#/components/schemas/createFeatureSchema', data),
    ).toBeUndefined();
});

test('createFeatureSchema without tags', () => {
    const data: CreateFeatureSchema = {
        name: 'disable-comments',
        type: 'release',
        description:
            'Controls disabling of the comments section in case of an incident',
        impressionData: false,
    };

    expect(
        validateSchema('#/components/schemas/createFeatureSchema', data),
    ).toBeUndefined();
});
