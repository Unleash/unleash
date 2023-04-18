import { FromSchema } from 'json-schema-to-ts';

export const addonParameterSchema = {
    $id: '#/components/schemas/addonParameterSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'displayName', 'type', 'required', 'sensitive'],
    description: 'An addon parameter definition.',
    properties: {
        name: {
            type: 'string',
            example: 'emojiIcon',
            description:
                'The name of the parameter as it is used in code. References to this parameter should use this value.',
        },
        displayName: {
            type: 'string',
            example: 'Emoji Icon',
            description:
                'The name of the parameter as it is shown to the end user in the Admin UI.',
        },
        type: {
            type: 'string',
            description:
                'The type of the parameter. Corresponds roughly to [HTML `input` field types](https://developer.mozilla.org/docs/Web/HTML/Element/Input#input_types). Multi-line inut fields are indicated as `textfield` (equivalent to the HTML `textarea` tag).',
            example: 'text',
        },
        description: {
            type: 'string',
            example:
                'The emoji_icon to use when posting messages to slack. Defaults to ":unleash:".',
            description:
                'A description of the parameter. This should explain to the end user what the parameter is used for.',
        },
        placeholder: {
            type: 'string',
            example: ':unleash:',
            description:
                'The default value for this parameter. This value is used if no other value is provided.',
        },
        required: {
            type: 'boolean',
            example: false,
            description:
                'Whether this parameter is required or not. If a parameter is required, you must give it a value when you create the addon. If it is not required it can be left out. It may receive a default value in those cases.',
        },
        sensitive: {
            type: 'boolean',
            example: false,
            description: `Indicates whether this parameter is **sensitive** or not. Unleash will not return sensitive parameters to API requests. It will instead use a number of asterisks to indicate that a value is set, e.g. "******". The number of asterisks does not correlate to the parameter\'s value.`,
        },
    },
    components: {},
} as const;

export type AddonParameterSchema = FromSchema<typeof addonParameterSchema>;
