import type { FromSchema } from 'json-schema-to-ts';
import { exportResultSchema } from './export-result-schema';
import { featureSchema } from './feature-schema';
import { featureStrategySchema } from './feature-strategy-schema';
import { contextFieldSchema } from './context-field-schema';
import { featureTagSchema } from './feature-tag-schema';
import { segmentSchema } from './segment-schema';
import { variantsSchema } from './variants-schema';
import { variantSchema } from './variant-schema';
import { overrideSchema } from './override-schema';
import { constraintSchema } from './constraint-schema';
import { parametersSchema } from './parameters-schema';
import { legalValueSchema } from './legal-value-schema';
import { tagTypeSchema } from './tag-type-schema';
import { featureEnvironmentSchema } from './feature-environment-schema';
import { strategyVariantSchema } from './strategy-variant-schema';
import { featureDependenciesSchema } from './feature-dependencies-schema';
import { dependentFeatureSchema } from './dependent-feature-schema';

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
