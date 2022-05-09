import { createSchemaObject, CreateSchemaType } from '../types';
import { strategySchema } from './strategy-schema';

let schema = {
    type: 'object',
    additionalProperties: false,
    required: ['environment', 'enabled', 'strategies'],
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
            items: {
                $ref: '#/components/schemas/strategySchema',
            },
        },
    },
    'components/schemas': {
        strategySchema,
    },
} as const;

export type FeatureEnvironmentInfoSchema = CreateSchemaType<typeof schema>;

export const featureEnvironmentInfoSchema = createSchemaObject(schema);
