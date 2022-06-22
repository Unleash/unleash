import { FromSchema } from 'json-schema-to-ts';
import { parametersSchema } from './parameters-schema';
import { variantSchema } from './variant-schema';
import { overrideSchema } from './override-schema';
import { featureStrategySchema } from './feature-strategy-schema';
import { featureSchema } from './feature-schema';
import { constraintSchema } from './constraint-schema';
import { environmentSchema } from './environment-schema';

export const healthOverviewSchema = {
    $id: '#/components/schemas/healthOverviewSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'name'],
    properties: {
        version: {
            type: 'number',
        },
        name: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        members: {
            type: 'number',
        },
        health: {
            type: 'number',
        },
        environments: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
        features: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureSchema',
            },
        },
        updatedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
    },
    components: {
        schemas: {
            constraintSchema,
            environmentSchema,
            featureSchema,
            overrideSchema,
            parametersSchema,
            featureStrategySchema,
            variantSchema,
        },
    },
} as const;

export type HealthOverviewSchema = FromSchema<typeof healthOverviewSchema>;
