import type { FromSchema } from 'json-schema-to-ts';
import { releasePlanMilestoneSchema } from './release-plan-milestone-schema.js';
import { releasePlanMilestoneStrategySchema } from './release-plan-milestone-strategy-schema.js';
import { constraintSchema } from './constraint-schema.js';
import { createFeatureStrategySchema } from './create-feature-strategy-schema.js';
import { createStrategyVariantSchema } from './create-strategy-variant-schema.js';
import { parametersSchema } from './parameters-schema.js';
import { transitionConditionSchema } from './transition-condition-schema.js';
import { safeguardSchema } from './safeguard-schema.js';
import { metricQuerySchema } from './metric-query-schema.js';
import { safeguardTriggerConditionSchema } from './safeguard-trigger-condition-schema.js';
import { releasePlanSchema } from './release-plan-schema.js';

export const releasePlansSchema = {
    $id: '#/components/schemas/releasePlansSchema',
    description: 'A collection of release plans',
    type: 'array',
    items: {
        $ref: '#/components/schemas/releasePlanSchema',
    },
    components: {
        schemas: {
            releasePlanSchema,
            releasePlanMilestoneSchema,
            releasePlanMilestoneStrategySchema,
            createFeatureStrategySchema,
            parametersSchema,
            constraintSchema,
            createStrategyVariantSchema,
            transitionConditionSchema,
            safeguardSchema,
            metricQuerySchema,
            safeguardTriggerConditionSchema,
        },
    },
} as const;

export type ReleasePlansSchema = FromSchema<
    typeof releasePlansSchema,
    { keepDefaultedPropertiesOptional: true }
>;
