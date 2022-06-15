import { validateSchema } from '../validate';
import { AddonDefinitionSchema } from './addon-definition-schema';

test('addonDefinitionSchema', () => {
    const data: AddonDefinitionSchema = {
        name: 'some-name',
        displayName: 'some-name',
        description: 'some-description',
        documentationUrl: 'some-url',
        type: 'some-type',
        placeholder: 'some-placeholder',
        required: true,
        sensitive: true,
    };

    expect(
        validateSchema('#/components/schemas/addonDefinitionSchema', data),
    ).toBeUndefined();
});
