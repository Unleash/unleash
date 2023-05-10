import { FromSchema } from 'json-schema-to-ts';
import { constraintSchema } from './constraint-schema';

export const upsertSegmentSchema = {
    $id: '#/components/schemas/upsertSegmentSchema',
    type: 'object',
    description:
        'Represents a segment of users defined by a set of constraints.',
    required: ['name', 'constraints'],
    properties: {
        name: {
            type: 'string',
            description: 'The name of the segment.',
        },
        description: {
            type: 'string',
            nullable: true,
            description: 'The description of the segment.',
        },
        project: {
            type: 'string',
            nullable: true,
            description:
                'Project from where this segment will be accessible. If none is defined the segment will be global (i.e. accessible from any project).',
        },
        constraints: {
            type: 'array',
            description:
                'List of constraints that determine which users will be part of the segment',
            items: {
                $ref: '#/components/schemas/constraintSchema',
            },
        },
    },
    example: {
        name: 'segment name',
        description: 'segment description',
        project: 'optional project id',
        constraints: [
            {
                contextName: 'environment',
                operator: 'IN',
                values: ['production', 'staging'],
            },
        ],
    },
    components: {
        schemas: {
            constraintSchema,
        },
    },
} as const;

export type UpsertSegmentSchema = FromSchema<typeof upsertSegmentSchema>;
