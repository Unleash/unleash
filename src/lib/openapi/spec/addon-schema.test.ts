import { validateSchema } from '../validate';
import { AddonSchema } from './addon-schema';

test('addonSchema', () => {
    const data: AddonSchema = {
        description: 'some-description',
        parameters: {
            someName: 'some-value',
        },
        enabled: true,
        events: ['some-event'],
        provider: 'some-provider',
    };

    expect(
        validateSchema('#/components/schemas/addonSchema', data),
    ).toBeUndefined();
});
