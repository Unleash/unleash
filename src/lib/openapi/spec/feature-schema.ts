import { createSchemaObject, CreateSchemaType } from '../types';
import { strategySchema } from './strategy-schema';
import { variantSchema } from './variant-schema';

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
        strategies: {
            type: 'array',
            items: strategySchema,
        },
        variants: {
            items: variantSchema,
            type: 'array',
        },
    },
} as const;

export type FeatureSchema = CreateSchemaType<typeof schema>;

export const featureSchema = createSchemaObject(schema);
