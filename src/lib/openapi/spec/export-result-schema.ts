import { FromSchema } from 'json-schema-to-ts';
import { featureSchema } from './feature-schema';
import { featureStrategySchema } from './feature-strategy-schema';
import { featureEnvironmentSchema } from './feature-environment-schema';
import { contextFieldSchema } from './context-field-schema';
import { featureTagSchema } from './feature-tag-schema';

export const exportResultSchema = {
    $id: '#/components/schemas/exportResultSchema',
    type: 'object',
    additionalProperties: false,
    required: ['features', 'featureStrategies'],
    properties: {
        features: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureSchema',
            },
        },
        featureStrategies: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureStrategySchema',
            },
        },
        featureEnvironments: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureEnvironmentSchema',
            },
        },
        contextFields: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/contextFieldSchema',
            },
        },
        featureTags: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureTagSchema',
            },
        },
    },
    components: {
        schemas: {
            featureSchema,
            featureStrategySchema,
            featureEnvironmentSchema,
            contextFieldSchema,
            featureTagSchema,
        },
    },
} as const;

export type ExportResultSchema = FromSchema<typeof exportResultSchema>;
