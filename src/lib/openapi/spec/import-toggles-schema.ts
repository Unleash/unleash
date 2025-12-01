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
import { releasePlanSchema } from './release-plan-schema.js';
import { releasePlanMilestoneSchema } from './release-plan-milestone-schema.js';
import { releasePlanMilestoneStrategySchema } from './release-plan-milestone-strategy-schema.js';
import { createFeatureStrategySchema } from './create-feature-strategy-schema.js';
import { createStrategyVariantSchema } from './create-strategy-variant-schema.js';
import { transitionConditionSchema } from './transition-condition-schema.js';
import { strategyVariantSchema } from './strategy-variant-schema.js';
import { featureDependenciesSchema } from './feature-dependencies-schema.js';
import { dependentFeatureSchema } from './dependent-feature-schema.js';
import { featureLinksSchema } from './feature-links-schema.js';
import { featureLinkSchema } from './feature-link-schema.js';
import { safeguardSchema } from './safeguard-schema.js';
import { metricQuerySchema } from './metric-query-schema.js';
import { safeguardTriggerConditionSchema } from './safeguard-trigger-condition-schema.js';

// error TS7056: The inferred type of this node exceeds the maximum length the compiler will serialize. An explicit type annotation is needed.
// We needed to do `as any` and then later recreate the type to bypass the maximum length serialization error.
const importTogglesSchemaComponents = {
    schemas: {
        exportResultSchema,
        featureSchema,
        featureStrategySchema,
        strategyVariantSchema,
        featureEnvironmentSchema,
        contextFieldSchema,
        featureTagSchema,
        segmentSchema,
        releasePlanSchema,
        releasePlanMilestoneSchema,
        releasePlanMilestoneStrategySchema,
        createFeatureStrategySchema,
        createStrategyVariantSchema,
        transitionConditionSchema,
        variantsSchema,
        variantSchema,
        overrideSchema,
        constraintSchema,
        parametersSchema,
        legalValueSchema,
        tagTypeSchema,
        featureDependenciesSchema,
        dependentFeatureSchema,
        featureLinksSchema,
        featureLinkSchema,
        safeguardSchema,
        metricQuerySchema,
        safeguardTriggerConditionSchema,
    },
} as const as any;

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
                'The exported [project](https://docs.getunleash.io/concepts/projects)',
        },
        environment: {
            type: 'string',
            example: 'development',
            description:
                'The exported [environment](https://docs.getunleash.io/concepts/environments)',
        },
        data: {
            $ref: '#/components/schemas/exportResultSchema',
        },
    },
    components: importTogglesSchemaComponents,
} as const;

export type ImportTogglesSchema = FromSchema<
    Omit<typeof importTogglesSchema, 'components'> & {
        components: {
            schemas: {
                exportResultSchema: typeof exportResultSchema;
                featureSchema: typeof featureSchema;
                featureStrategySchema: typeof featureStrategySchema;
                strategyVariantSchema: typeof strategyVariantSchema;
                featureEnvironmentSchema: typeof featureEnvironmentSchema;
                contextFieldSchema: typeof contextFieldSchema;
                featureTagSchema: typeof featureTagSchema;
                segmentSchema: typeof segmentSchema;
                releasePlanSchema: typeof releasePlanSchema;
                releasePlanMilestoneSchema: typeof releasePlanMilestoneSchema;
                releasePlanMilestoneStrategySchema: typeof releasePlanMilestoneStrategySchema;
                createFeatureStrategySchema: typeof createFeatureStrategySchema;
                createStrategyVariantSchema: typeof createStrategyVariantSchema;
                transitionConditionSchema: typeof transitionConditionSchema;
                variantsSchema: typeof variantsSchema;
                variantSchema: typeof variantSchema;
                overrideSchema: typeof overrideSchema;
                constraintSchema: typeof constraintSchema;
                parametersSchema: typeof parametersSchema;
                legalValueSchema: typeof legalValueSchema;
                tagTypeSchema: typeof tagTypeSchema;
                featureDependenciesSchema: typeof featureDependenciesSchema;
                dependentFeatureSchema: typeof dependentFeatureSchema;
                featureLinksSchema: typeof featureLinksSchema;
                featureLinkSchema: typeof featureLinkSchema;
                safeguardSchema: typeof safeguardSchema;
                metricQuerySchema: typeof metricQuerySchema;
                safeguardTriggerConditionSchema: typeof safeguardTriggerConditionSchema;
            };
        };
    }
>;
