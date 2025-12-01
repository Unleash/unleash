import type { FromSchema } from 'json-schema-to-ts';
import { constraintSchema } from './constraint-schema.js';
import { parametersSchema } from './parameters-schema.js';
import { featureStrategySchema } from './feature-strategy-schema.js';
import { variantSchema } from './variant-schema.js';
import { overrideSchema } from './override-schema.js';
import { strategyVariantSchema } from './strategy-variant-schema.js';
import { dependentFeatureSchema } from './dependent-feature-schema.js';

export const clientFeatureSchema = {
    $id: '#/components/schemas/clientFeatureSchema',
    type: 'object',
    required: ['name', 'enabled'],
    description:
        'Feature flag configuration used by SDKs to evaluate state of a flag',
    additionalProperties: false,
    properties: {
        name: {
            type: 'string',
            description:
                'The unique name of a feature flag. Is validated to be URL safe on creation',
            example: 'new.payment.flow.stripe',
        },
        type: {
            type: 'string',
            description:
                'What kind of feature flag is this. Refer to the documentation on [feature flag types](https://docs.getunleash.io/concepts/feature-flags#feature-flag-types) for more information',
            example: 'release',
        },
        description: {
            type: 'string',
            description: 'A description of the flag',
            nullable: true,
            example: 'No variants here',
        },
        enabled: {
            type: 'boolean',
            description:
                'Whether the feature flag is enabled for the current API key or not. This is ANDed with the evaluation results of the strategies list, so if this is false, the evaluation result will always be false',
            example: true,
        },
        stale: {
            description:
                'If this is true Unleash believes this feature flag has been active longer than Unleash expects a flag of this type to be active',
            type: 'boolean',
            example: false,
        },
        impressionData: {
            description:
                'Set to true if SDKs should trigger [impression events](https://docs.getunleash.io/concepts/impression-data) when this flag is evaluated',
            type: 'boolean',
            nullable: true,
            example: false,
        },
        project: {
            description: 'Which project this feature flag belongs to',
            type: 'string',
            example: 'new.payment.flow',
        },
        strategies: {
            type: 'array',
            description:
                'Evaluation strategies for this flag. Each entry in this list will be evaluated and ORed together',
            items: {
                $ref: '#/components/schemas/featureStrategySchema',
            },
        },
        variants: {
            type: 'array',
            description:
                '[Variants](https://docs.getunleash.io/concepts/feature-flag-variants#what-are-variants) configured for this flag',
            items: {
                $ref: '#/components/schemas/variantSchema',
            },
            nullable: true,
        },
        dependencies: {
            type: 'array',
            description: 'Feature dependencies for this flag',
            items: {
                $ref: '#/components/schemas/dependentFeatureSchema',
            },
        },
    },
    components: {
        schemas: {
            constraintSchema,
            parametersSchema,
            featureStrategySchema,
            strategyVariantSchema,
            variantSchema,
            overrideSchema,
            dependentFeatureSchema,
        },
    },
} as const;

export type ClientFeatureSchema = FromSchema<typeof clientFeatureSchema>;
