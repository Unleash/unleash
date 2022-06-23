import { FromSchema } from 'json-schema-to-ts';
import { constraintSchema } from './constraint-schema';

export const updateFeatureSchema = {
    $id: '#/components/schemas/updateFeatureSchema',
    type: 'object',
    required: ['name'],
    properties: {
        name: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        type: {
            type: 'string',
        },
        stale: {
            type: 'boolean',
        },
        archived: {
            type: 'boolean',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
        },
        impressionData: {
            type: 'boolean',
        },
        constraints: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/constraintSchema',
            },
        },
    },
    components: {
        schemas: {
            constraintSchema,
        },
    },
} as const;

export type UpdateFeatureSchema = FromSchema<typeof updateFeatureSchema>;
