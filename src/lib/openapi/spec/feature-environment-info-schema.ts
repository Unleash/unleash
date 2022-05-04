import { createSchemaObject, CreateSchemaType } from '../types';
import { strategiesSchema } from './strategies-schema';

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
        strategies: strategiesSchema,
    },
} as const;

export type FeatureEnvironmentInfoSchema = CreateSchemaType<typeof schema>;

export const featureEnvironmentInfoSchema = createSchemaObject(schema);
