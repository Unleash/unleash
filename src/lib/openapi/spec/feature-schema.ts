import { createSchemaObject, CreateSchemaType } from '../types';
import { strategySchema } from './strategy-schema';
import { variantSchema } from './variant-schema';
import { featureEnvironmentInfoSchema } from './feature-environment-info-schema';

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
                $ref: '#/components/schemas/featureEnvironmentInfoSchema',
            },
        },
        strategies: {
            type: 'array',
            items: { $ref: '#/components/schemas/strategySchema' },
        },
        variants: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/variantSchema',
            },
        },
    },
    'components/schemas': {
        featureEnvironmentInfoSchema,
        strategySchema,
        variantSchema,
    },
} as const;

export type FeatureSchema = CreateSchemaType<typeof schema>;

export const featureSchema = createSchemaObject(schema);
