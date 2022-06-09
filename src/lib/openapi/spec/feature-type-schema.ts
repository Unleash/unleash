import { FromSchema } from 'json-schema-to-ts';

export const featureTypeSchema = {
    $id: '#/components/schemas/featureTypeSchema',
    type: 'object',
    additionalProperties: false,
    required: ['id', 'name', 'description', 'lifetimeDays'],
    properties: {
        id: {
            type: 'string',
        },
        name: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        lifetimeDays: {
            type: 'number',
            nullable: true,
        },
    },
    components: {},
} as const;

export type FeatureTypeSchema = FromSchema<typeof featureTypeSchema>;
