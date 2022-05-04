import { createSchemaObject, CreateSchemaType } from '../types';
import { strategySchema } from './strategy-schema';

const schema = {
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
        enabled: {
            type: 'boolean',
        },
        strategies: {
            type: 'array',
            items: strategySchema,
        },
    },
};

export type FeatureEnvironmentInfoSchema = CreateSchemaType<typeof schema>;

export const featureEnvironmentInfoSchema = createSchemaObject(schema);
