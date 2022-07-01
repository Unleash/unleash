import { FromSchema } from 'json-schema-to-ts';
import { variantSchema } from './variant-schema';
import { constraintSchema } from './constraint-schema';
import { overrideSchema } from './override-schema';
import { parametersSchema } from './parameters-schema';
import { environmentSchema } from './environment-schema';
import { featureStrategySchema } from './feature-strategy-schema';

export const featureSchema = {
    $id: '#/components/schemas/featureSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name'],
    properties: {
        name: {
            type: 'string',
        },
        type: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        archived: {
            type: 'boolean',
        },
        project: {
            type: 'string',
        },
        enabled: {
            type: 'boolean',
        },
        stale: {
            type: 'boolean',
        },
        impressionData: {
            type: 'boolean',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
        archivedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
        lastSeenAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
        environments: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/environmentSchema',
            },
        },
        strategies: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureStrategySchema',
            },
        },
        variants: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/variantSchema',
            },
        },
    },
    components: {
        schemas: {
            constraintSchema,
            environmentSchema,
            overrideSchema,
            parametersSchema,
            featureStrategySchema,
            variantSchema,
        },
    },
} as const;

export type FeatureSchema = FromSchema<typeof featureSchema>;
