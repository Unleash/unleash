import { FromSchema } from 'json-schema-to-ts';
import { featureSchema } from './feature-schema';
import { featureStrategySchema } from './feature-strategy-schema';

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
    },
    components: {
        schemas: {
            featureSchema,
            featureStrategySchema,
        },
    },
} as const;

export type ExportResultSchema = FromSchema<typeof exportResultSchema>;
