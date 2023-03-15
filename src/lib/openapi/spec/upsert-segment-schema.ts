import { FromSchema } from 'json-schema-to-ts';
import { constraintSchema } from './constraint-schema';

export const upsertSegmentSchema = {
    $id: '#/components/schemas/upsertSegmentSchema',
    type: 'object',
    required: ['name', 'constraints'],
    properties: {
        name: {
            type: 'string',
        },
        description: {
            type: 'string',
            nullable: true,
        },
        project: {
            type: 'string',
            nullable: true,
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

export type UpsertSegmentSchema = FromSchema<typeof upsertSegmentSchema>;
