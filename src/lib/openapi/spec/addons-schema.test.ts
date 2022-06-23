import { validateSchema } from '../validate';
import { AddonsSchema } from './addons-schema';

test('addonsSchema', () => {
    const data: AddonsSchema = {
        addons: [
            {
                parameters: { someKey: 'some-value' },
                events: ['some-event'],
                enabled: true,
                provider: 'some-name',
            },
        ],
        providers: [
            {
                name: 'some-name',
                displayName: 'some-display-name',
                documentationUrl: 'some-url',
                description: 'some-description',
                parameters: [
                    {
                        name: 'some-name',
                        displayName: 'some-display-name',
                        type: 'some-type',
                        required: true,
                        sensitive: true,
                    },
                ],
            },
        ],
    };

    expect(
        validateSchema('#/components/schemas/addonsSchema', data),
    ).toBeUndefined();
});
