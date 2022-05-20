import { createSchemaObject, CreateSchemaType } from '../types';
import { strategySchema } from './strategy-schema';
import { variantSchema } from './variant-schema';
import { featureEnvironmentSchema } from './feature-environment-schema';

const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['name', 'project'],
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
            format: 'date',
            nullable: true,
        },
        lastSeenAt: {
            type: 'string',
            format: 'date',
            nullable: true,
        },
        environments: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureEnvironmentSchema',
            },
        },
        strategies: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/strategySchema',
            },
        },
        variants: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/variantSchema',
            },
        },
    },
    'components/schemas': {
        featureEnvironmentSchema,
        strategySchema,
        variantSchema,
    },
} as const;

export type FeatureSchema = CreateSchemaType<typeof schema>;

export const featureSchema = createSchemaObject(schema);
