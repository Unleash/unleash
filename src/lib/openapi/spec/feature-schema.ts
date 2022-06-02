import { FromSchema } from 'json-schema-to-ts';
import { DeepMutable } from '../../types/mutable';
import { strategySchema } from './strategy-schema';
import { variantSchema } from './variant-schema';
import { featureEnvironmentSchema } from './feature-environment-schema';

const schema = {
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
        lastSeenAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
        environments: {
            type: 'array',
            items: featureEnvironmentSchema,
        },
        strategies: {
            type: 'array',
            items: strategySchema,
        },
        variants: {
            type: 'array',
            items: variantSchema,
        },
    },
} as const;

export type FeatureSchema = FromSchema<typeof schema>;

export const featureSchema = schema as DeepMutable<typeof schema>;
