import { FromSchema } from 'json-schema-to-ts';
import { legalValueSchema } from './legal-value-schema';

export const contextFieldSchema = {
    $id: '#/components/schemas/contextFieldSchema',
    type: 'object',
    additionalProperties: false,
    description:
        'A [context field](https://docs.getunleash.io/reference/unleash-context) used to configure strategies with data used to evaluate isEnabled calls',
    required: ['name'],
    properties: {
        name: {
            description: 'The name of the context field',
            type: 'string',
            example: 'userId',
        },
        description: {
            description: 'The description of the context field.',
            type: 'string',
            nullable: true,
            example: 'Used to uniquely identify users',
        },
        stickiness: {
            description:
                'Does this context field support being used for [stickiness](https://docs.getunleash.io/reference/stickiness) calculations',
            type: 'boolean',
            example: true,
        },
        sortOrder: {
            description:
                'Used to have deterministic sorting of a list of context fields. Can also be used as a draw-breaker if list of context fields is sorted alphabetically.',
            type: 'number',
            example: 900,
        },
        createdAt: {
            description: 'When this context field was created',
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-06-29T10:19:00.000Z',
        },
        usedInFeatures: {
            type: 'number',
            description:
                'Number of projects where this context field is used in',
            example: 3,
            nullable: true,
            minimum: 0,
        },
        usedInProjects: {
            type: 'number',
            description:
                'Number of projects where this context field is used in',
            example: 2,
            nullable: true,
            minimum: 0,
        },
        legalValues: {
            description:
                'Allowed values for this context field schema. Can be used to narrow down accepted input',
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
