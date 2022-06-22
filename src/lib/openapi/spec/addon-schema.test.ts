import { validateSchema } from '../validate';
import { AddonSchema } from './addon-schema';

test('addonSchema', () => {
    const data: AddonSchema = {
        provider: 'some-provider',
        enabled: true,
        parameters: {
            someKey: 'some-value',
        },
        events: ['some-event'],
    };

    expect(
        validateSchema('#/components/schemas/addonSchema', data),
    ).toBeUndefined();
});
