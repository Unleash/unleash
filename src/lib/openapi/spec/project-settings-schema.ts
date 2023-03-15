import { FromSchema } from 'json-schema-to-ts';

export const projectSettingsSchema = {
    $id: '#/components/schemas/projectSettingsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['defaultStickiness'],
    properties: {
        defaultStickiness: {
            type: 'string',
            example: 'userId',
            nullable: true,
        },
        mode: {
            type: 'string',
            enum: ['open', 'protected', 'private'],
            nullable: true,
        },
    },
    components: {},
} as const;

export type ProjectSettingsSchema = FromSchema<typeof projectSettingsSchema>;
