import { FromSchema } from 'json-schema-to-ts';

export const tagSchema = {
    $id: '#/components/schemas/tagSchema',
    type: 'object',
    additionalProperties: false,
    required: ['value', 'type'],
    properties: {
        value: {
            type: 'string',
        },
        type: {
            type: 'string',
        },
    },
    components: {},
} as const;

export type TagSchema = FromSchema<typeof tagSchema>;
