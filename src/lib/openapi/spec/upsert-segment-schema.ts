import type { FromSchema } from 'json-schema-to-ts';
import { constraintSchema } from './constraint-schema.js';

export const upsertSegmentSchema = {
    $id: '#/components/schemas/upsertSegmentSchema',
    type: 'object',
    description: 'Data used to create or update a segment',
    required: ['name', 'constraints'],
    properties: {
        name: {
            description: 'The name of the segment',
            example: 'beta-users',
            type: 'string',
        },
        description: {
            type: 'string',
            nullable: true,
            description: 'A description of what the segment is for',
            example: 'Users willing to help us test and build new features.',
        },
        project: {
            type: 'string',
            nullable: true,
            description: 'The project the segment belongs to if any.',
            example: 'red-vista',
        },
        constraints: {
            type: 'array',
            description: 'The list of constraints that make up this segment',
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

export type UpsertSegmentSchema = FromSchema<
    typeof upsertSegmentSchema,
    { keepDefaultedPropertiesOptional: true }
>;
