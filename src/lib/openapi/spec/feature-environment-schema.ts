import { createSchemaObject, CreateSchemaType } from '../types';
import { featureStrategySchema } from './feature-strategy-schema';

let schema = {
    type: 'object',
    additionalProperties: false,
    required: ['name', 'environment', 'enabled', 'strategies'],
    properties: {
        name: {
            type: 'string',
        },
        environment: {
            type: 'string',
        },
        type: {
            type: 'string',
        },
        enabled: {
            type: 'boolean',
        },
        strategies: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureStrategySchema',
            },
        },
    },
    'components/schemas': {
        featureStrategySchema,
    },
} as const;

export type FeatureEnvironmentSchema = CreateSchemaType<typeof schema>;

export const featureEnvironmentSchema = createSchemaObject(schema);
