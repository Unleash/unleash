import { FromSchema } from 'json-schema-to-ts';
import { constraintSchema } from './constraint-schema';
import { parametersSchema } from './parameters-schema';
import { featureStrategySchema } from './feature-strategy-schema';
import { variantSchema } from './variant-schema';
import { overrideSchema } from './override-schema';

export const clientFeatureSchema = {
    $id: '#/components/schemas/clientFeatureSchema',
    type: 'object',
    required: ['name', 'enabled'],
    description:
        'Feature toggle configuration used by SDKs to evaluate state of a toggle',
    additionalProperties: false,
    properties: {
        name: {
            type: 'string',
            description:
                'The unique name of a feature toggle. Is validated to be URL safe on creation',
            example: 'new.payment.flow.stripe',
        },
        type: {
            type: 'string',
            description:
                'What kind of feature flag is this. Refer to the documentation on [feature toggle types](https://docs.getunleash.io/reference/feature-toggle-types) for more information',
            example: 'release',
        },
        description: {
            type: 'string',
            description: 'A description of the toggle',
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
                'If this is true Unleash believes this feature toggle has been active longer than Unleash expects a toggle of this type to be active',
            type: 'boolean',
            example: false,
        },
        impressionData: {
            description:
                'Set to true if SDKs should trigger [impression events](https://docs.getunleash.io/reference/impression-data) when this toggle is evaluated',
            type: 'boolean',
            nullable: true,
            example: false,
        },
        project: {
            description: 'Which project this feature toggle belongs to',
            type: 'string',
            example: 'new.payment.flow',
        },
        strategies: {
            type: 'array',
            description:
                'Evaluation strategies for this toggle. Each entry in this list will be evaluated and ORed together',
            items: {
                $ref: '#/components/schemas/featureStrategySchema',
            },
        },
        variants: {
            type: 'array',
            description:
                '[Variants](https://docs.getunleash.io/reference/feature-toggle-variants#what-are-variants) configured for this toggle',
            items: {
                $ref: '#/components/schemas/variantSchema',
            },
            nullable: true,
        },
    },
    components: {
        schemas: {
            constraintSchema,
            parametersSchema,
            featureStrategySchema,
            variantSchema,
            overrideSchema,
        },
    },
} as const;

export type ClientFeatureSchema = FromSchema<typeof clientFeatureSchema>;
