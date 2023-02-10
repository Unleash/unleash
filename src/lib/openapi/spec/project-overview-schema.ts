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

export const projectOverviewSchema = {
    $id: '#/components/schemas/projectOverviewSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'name'],
    properties: {
        stats: {
            $ref: '#/components/schemas/projectStatsSchema',
            description: 'Project statistics',
        },
        version: {
            type: 'number',
            example: 1,
            description: '',
        },
        name: {
            type: 'string',
            example: 'dx-squad',
            description: 'Name of this project used to identify it',
        },
        description: {
            type: 'string',
            nullable: true,
            example: 'DX squad feature release',
            description: 'Additional information about the project',
        },
        members: {
            type: 'number',
            example: 4,
            description: 'Count of the project members',
        },
        health: {
            type: 'number',
            example: 50,
            description: 'Indicator of the project health in the 0-100 scale',
        },
        environments: {
            type: 'array',
            items: {
                type: 'string',
            },
            example: ['development', 'production'],
            description: 'Enabled environments for this project',
        },
        features: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureSchema',
            },
            description: 'List of features in this project',
        },
        updatedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-02-10T08:36:35.262Z',
            description: 'Last modification data of this project',
        },
        favorite: {
            type: 'boolean',
            example: true,
            description: 'Is this project added to your favourite list',
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

export type ProjectOverviewSchema = FromSchema<typeof projectOverviewSchema>;
