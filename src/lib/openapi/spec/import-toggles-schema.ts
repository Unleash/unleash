import { FromSchema } from 'json-schema-to-ts';
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

export const importTogglesSchema = {
    $id: '#/components/schemas/importTogglesSchema',
    type: 'object',
    required: ['project', 'environment', 'data'],
    additionalProperties: false,
    properties: {
        project: {
            type: 'string',
        },
        environment: {
            type: 'string',
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
        },
    },
} as const;

export type ImportTogglesSchema = FromSchema<typeof importTogglesSchema>;
