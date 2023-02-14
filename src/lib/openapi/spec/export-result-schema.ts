import { FromSchema } from 'json-schema-to-ts';
import { featureSchema } from './feature-schema';
import { featureStrategySchema } from './feature-strategy-schema';
import { featureEnvironmentSchema } from './feature-environment-schema';
import { contextFieldSchema } from './context-field-schema';
import { featureTagSchema } from './feature-tag-schema';
import { parametersSchema } from './parameters-schema';
import { legalValueSchema } from './legal-value-schema';
import { variantSchema } from './variant-schema';
import { overrideSchema } from './override-schema';
import { variantsSchema } from './variants-schema';
import { constraintSchema } from './constraint-schema';
import { tagTypeSchema } from './tag-type-schema';

export const exportResultSchema = {
    $id: '#/components/schemas/exportResultSchema',
    type: 'object',
    additionalProperties: false,
    required: ['features', 'featureStrategies', 'tagTypes'],
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
        segments: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['id'],
                properties: {
                    id: {
                        type: 'number',
                    },
                    name: {
                        type: 'string',
                    },
                },
            },
        },
        tagTypes: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/tagTypeSchema',
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
            variantsSchema,
            variantSchema,
            overrideSchema,
            constraintSchema,
            parametersSchema,
            legalValueSchema,
            tagTypeSchema,
        },
    },
} as const;

export type ExportResultSchema = FromSchema<typeof exportResultSchema>;
