import { validateSchema } from '../validate.js';
import type { AddonSchema } from './addon-schema.js';

test('addonSchema', () => {
    const data: AddonSchema = {
        provider: 'some-provider',
        enabled: true,
        description: null,
        id: 5,
        parameters: {
            someKey: 'some-value',
        },
        events: ['some-event'],
    };

    expect(
        validateSchema('#/components/schemas/addonSchema', data),
    ).toBeUndefined();
});
