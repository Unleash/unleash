import { FromSchema } from 'json-schema-to-ts';
import { DeepMutable } from '../../types/mutable';
import { featureStrategySchema } from './feature-strategy-schema';

let schema = {
    type: 'object',
    additionalProperties: false,
    required: ['name', 'enabled'],
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
            items: featureStrategySchema,
        },
    },
} as const;

export type FeatureEnvironmentSchema = FromSchema<typeof schema>;

export const featureEnvironmentSchema = schema as DeepMutable<typeof schema>;
