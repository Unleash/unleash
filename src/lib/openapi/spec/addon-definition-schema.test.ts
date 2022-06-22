import { validateSchema } from '../validate';
import { AddonTypeSchema } from './addon-type-schema';

test('addonDefinitionSchema', () => {
    const data: AddonTypeSchema = {
        name: 'some-name',
        displayName: 'some-name',
        description: 'some-description',
        documentationUrl: 'some- url',
        type: 'some-type',
        placeholder: 'some-placeholder',
        required: true,
        sensitive: true,
    };

    expect(
        validateSchema('#/components/schemas/AddonTypeSchema', data),
    ).toBeUndefined();
});
