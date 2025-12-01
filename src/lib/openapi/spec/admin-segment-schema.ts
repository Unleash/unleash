import type { FromSchema } from 'json-schema-to-ts';
import { constraintSchema } from './constraint-schema.js';

export const adminSegmentSchema = {
    $id: '#/components/schemas/adminSegmentSchema',
    type: 'object',
    required: ['id', 'name', 'constraints', 'createdAt'],
    description:
        'A description of a [segment](https://docs.getunleash.io/concepts/segments)',
    additionalProperties: false,
    properties: {
        id: {
            type: 'integer',
            description: 'The ID of this segment',
            example: 2,
            minimum: 0,
        },
        name: {
            type: 'string',
            description: 'The name of this segment',
            example: 'ios-users',
        },
        description: {
            type: 'string',
            nullable: true,
            description: 'The description for this segment',
            example: 'IOS users segment',
        },
        constraints: {
            type: 'array',
            description:
                'The list of constraints that are used in this segment',
            items: {
                $ref: '#/components/schemas/constraintSchema',
            },
        },
        usedInFeatures: {
            type: 'integer',
            minimum: 0,
            description:
                'The number of feature flags that use this segment. The number also includes the any flags with pending change requests that would add this segment.',
            example: 3,
            nullable: true,
        },
        usedInProjects: {
            type: 'integer',
            minimum: 0,
            description:
                'The number of projects that use this segment. The number includes any projects with pending change requests that would add this segment.',
            example: 2,
            nullable: true,
        },
        project: {
            type: 'string',
            nullable: true,
            example: 'red-vista',
            description:
                'The project the segment belongs to. Only present if the segment is a project-specific segment.',
        },
        createdBy: {
            description: "The creator's email or username",
            example: 'someone@example.com',
            type: 'string',
            nullable: true,
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'When the segment was created',
            example: '2023-04-12T11:13:31.960Z',
        },
    },
    components: {
        schemas: {
            constraintSchema,
        },
    },
} as const;

export type AdminSegmentSchema = FromSchema<typeof adminSegmentSchema>;
