import { FromSchema } from 'json-schema-to-ts';
import { legalValueSchema } from './legal-value-schema';

export const contextFieldSchema = {
    $id: '#/components/schemas/contextFieldSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name'],
    properties: {
        name: {
            type: 'string',
        },
        description: {
            type: 'string',
            nullable: true,
        },
        stickiness: {
            type: 'boolean',
        },
        sortOrder: {
            type: 'number',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
        usedInFeatures: {
            type: 'number',
            description:
                'Number of projects where this context field is used in',
            example: 3,
            nullable: true,
        },
        usedInProjects: {
            type: 'number',
            description:
                'Number of projects where this context field is used in',
            example: 2,
            nullable: true,
        },
        legalValues: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/legalValueSchema',
            },
        },
    },
    components: {
        schemas: {
            legalValueSchema,
        },
    },
} as const;

export type ContextFieldSchema = FromSchema<typeof contextFieldSchema>;
