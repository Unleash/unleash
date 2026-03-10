import type { FromSchema } from 'json-schema-to-ts';
import { releasePlanTemplateSchema } from './release-plan-template-schema.js';
import { releasePlanMilestoneSchema } from './release-plan-milestone-schema.js';
import { releasePlanMilestoneStrategySchema } from './release-plan-milestone-strategy-schema.js';
import { constraintSchema } from './constraint-schema.js';
import { createFeatureStrategySchema } from './create-feature-strategy-schema.js';
import { createStrategyVariantSchema } from './create-strategy-variant-schema.js';
import { parametersSchema } from './parameters-schema.js';
import { transitionConditionSchema } from './transition-condition-schema.js';

export const releasePlanTemplatesSchema = {
    $id: '#/components/schemas/releasePlanTemplatesSchema',
    description: 'A collection of release plan templates',
    type: 'array',
    items: {
        $ref: '#/components/schemas/releasePlanTemplateSchema',
    },
    components: {
        schemas: {
            releasePlanTemplateSchema,
            releasePlanMilestoneSchema,
            releasePlanMilestoneStrategySchema,
            createFeatureStrategySchema,
            parametersSchema,
            constraintSchema,
            createStrategyVariantSchema,
            transitionConditionSchema,
        },
    },
} as const;

export type ReleasePlanTemplatesSchema = FromSchema<
    typeof releasePlanTemplatesSchema,
    { keepDefaultedPropertiesOptional: true }
>;
