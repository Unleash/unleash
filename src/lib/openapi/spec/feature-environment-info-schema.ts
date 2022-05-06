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
        strategySchema: strategySchema,
    },
} as const;

export type FeatureEnvironmentInfoSchema = CreateSchemaType<typeof schema>;

const { 'components/schemas': componentsSchemas, ...rest } = schema;
export const featureEnvironmentInfoSchema = createSchemaObject(rest);
