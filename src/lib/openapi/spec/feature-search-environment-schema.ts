import type { FromSchema } from 'json-schema-to-ts';
import { constraintSchema } from './constraint-schema.js';
import { parametersSchema } from './parameters-schema.js';
import { featureStrategySchema } from './feature-strategy-schema.js';
import { variantSchema } from './variant-schema.js';
import { strategyVariantSchema } from './strategy-variant-schema.js';
import { featureEnvironmentSchema } from './feature-environment-schema.js';
import { releasePlanSchema } from './release-plan-schema.js';
import { releasePlanMilestoneSchema } from './release-plan-milestone-schema.js';
import { releasePlanMilestoneStrategySchema } from './release-plan-milestone-strategy-schema.js';
import { createFeatureStrategySchema } from './create-feature-strategy-schema.js';
import { createStrategyVariantSchema } from './create-strategy-variant-schema.js';
import { transitionConditionSchema } from './transition-condition-schema.js';

export const featureSearchEnvironmentSchema = {
    $id: '#/components/schemas/featureSearchEnvironmentSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'enabled', 'type'],
    description: 'A detailed description of the feature environment',
    properties: {
        ...featureEnvironmentSchema.properties,
        yes: {
            description:
                'How many times the toggle evaluated to true in last hour bucket',
            type: 'integer',
            example: 974,
            minimum: 0,
        },
        no: {
            description:
                'How many times the toggle evaluated to false in last hour bucket',
            type: 'integer',
            example: 50,
            minimum: 0,
        },
    },
    components: {
        schemas: {
            constraintSchema,
            parametersSchema,
            featureStrategySchema,
            strategyVariantSchema,
            featureEnvironmentSchema,
            variantSchema,
            releasePlanSchema,
            releasePlanMilestoneSchema,
            releasePlanMilestoneStrategySchema,
            transitionConditionSchema,
            createFeatureStrategySchema,
            createStrategyVariantSchema,
        },
    },
} as const;

export type FeatureSearchEnvironmentSchema = FromSchema<
    typeof featureSearchEnvironmentSchema,
    { keepDefaultedPropertiesOptional: true }
>;
