import type { FromSchema } from 'json-schema-to-ts';
import { exportResultSchema } from './export-result-schema.js';
import { featureSchema } from './feature-schema.js';
import { featureStrategySchema } from './feature-strategy-schema.js';
import { contextFieldSchema } from './context-field-schema.js';
import { featureTagSchema } from './feature-tag-schema.js';
import { segmentSchema } from './segment-schema.js';
import { variantsSchema } from './variants-schema.js';
import { variantSchema } from './variant-schema.js';
import { overrideSchema } from './override-schema.js';
import { constraintSchema } from './constraint-schema.js';
import { parametersSchema } from './parameters-schema.js';
import { legalValueSchema } from './legal-value-schema.js';
import { tagTypeSchema } from './tag-type-schema.js';
import { featureEnvironmentSchema } from './feature-environment-schema.js';
import { strategyVariantSchema } from './strategy-variant-schema.js';
import { featureDependenciesSchema } from './feature-dependencies-schema.js';
import { dependentFeatureSchema } from './dependent-feature-schema.js';

export const importTogglesSchema = {
    $id: '#/components/schemas/importTogglesSchema',
    type: 'object',
    required: ['project', 'environment', 'data'],
    additionalProperties: false,
    description:
        'The result of the export operation for a project and environment, used at import',
    properties: {
        project: {
            type: 'string',
            example: 'My awesome project',
            description:
                'The exported [project](https://docs.getunleash.io/reference/projects)',
        },
        environment: {
            type: 'string',
            example: 'development',
            description:
                'The exported [environment](https://docs.getunleash.io/reference/environments)',
        },
        data: {
            $ref: '#/components/schemas/exportResultSchema',
        },
    },
    components: {
        schemas: {
            exportResultSchema,
            featureSchema,
            featureStrategySchema,
            strategyVariantSchema,
            featureEnvironmentSchema,
            contextFieldSchema,
            featureTagSchema,
            segmentSchema,
            variantsSchema,
            variantSchema,
            overrideSchema,
            constraintSchema,
            parametersSchema,
            legalValueSchema,
            tagTypeSchema,
            featureDependenciesSchema,
            dependentFeatureSchema,
        },
    },
} as const;

export type ImportTogglesSchema = FromSchema<typeof importTogglesSchema>;
