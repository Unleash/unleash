import { FromSchema } from 'json-schema-to-ts';

export const importTogglesValidateItemSchema = {
    $id: '#/components/schemas/importTogglesValidateItemSchema',
    type: 'object',
    required: ['message', 'affectedItems'],
    additionalProperties: false,
    properties: {
        message: {
            type: 'string',
        },
        affectedItems: {
            type: 'array',
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
