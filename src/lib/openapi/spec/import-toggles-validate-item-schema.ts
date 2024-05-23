import type { FromSchema } from 'json-schema-to-ts';

export const importTogglesValidateItemSchema = {
    $id: '#/components/schemas/importTogglesValidateItemSchema',
    type: 'object',
    required: ['message', 'affectedItems'],
    additionalProperties: false,
    description:
        'A description of an error or warning pertaining to a feature flag import job.',
    properties: {
        message: {
            type: 'string',
            description: 'The validation error message',
            example:
                'You cannot import a feature that already exist in other projects. You already have the following features defined outside of project default:',
        },
        affectedItems: {
            type: 'array',
            description: 'The items affected by this error message ',
            example: ['some-feature-a', 'some-feature-b'],
            items: {
                type: 'string',
            },
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type ImportTogglesValidateItemSchema = FromSchema<
    typeof importTogglesValidateItemSchema
>;
