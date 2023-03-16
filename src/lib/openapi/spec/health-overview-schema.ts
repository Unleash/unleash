import { FromSchema } from 'json-schema-to-ts';
import { parametersSchema } from './parameters-schema';
import { variantSchema } from './variant-schema';
import { overrideSchema } from './override-schema';
import { featureStrategySchema } from './feature-strategy-schema';
import { featureSchema } from './feature-schema';
import { constraintSchema } from './constraint-schema';
import { environmentSchema } from './environment-schema';
import { featureEnvironmentSchema } from './feature-environment-schema';
import { projectStatsSchema } from './project-stats-schema';

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
            nullable: true,
        },
        mode: {
            type: 'string',
            enum: ['open', 'protected'],
            example: 'open',
            nullable: true,
            description:
                'A mode of the project affecting what actions are possible in this project. During a rollout of project modes this feature can be optional or `null`',
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
        favorite: {
            type: 'boolean',
        },
        stats: {
            $ref: '#/components/schemas/projectStatsSchema',
            description: 'Project statistics',
        },
    },
    components: {
        schemas: {
            constraintSchema,
            environmentSchema,
            featureSchema,
            featureEnvironmentSchema,
            overrideSchema,
            parametersSchema,
            featureStrategySchema,
            variantSchema,
            projectStatsSchema,
        },
    },
} as const;

export type HealthOverviewSchema = FromSchema<typeof healthOverviewSchema>;
