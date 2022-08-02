import { FromSchema } from 'json-schema-to-ts';
import { parametersSchema } from './parameters-schema';
import { variantSchema } from './variant-schema';
import { overrideSchema } from './override-schema';
import { playgroundStrategySchema } from './playground-strategy-schema';
import { playgroundConstraintSchema } from './playground-constraint-schema';
import { playgroundSegmentSchema } from './playground-segment-schema';

export const unknownFeatureEvaluationResult = 'unevaluated' as const;

export const playgroundFeatureSchema = {
    $id: '#/components/schemas/playgroundFeatureSchema',
    description:
        'A simplified feature toggle model intended for the Unleash playground.',
    type: 'object',
    additionalProperties: false,
    required: [
        'name',
        'projectId',
        'isEnabled',
        'isEnabledInCurrentEnvironment',
        'variant',
        'variants',
        'strategies',
    ],
    properties: {
        name: {
            type: 'string',
            example: 'my-feature',
            description: "The feature's name.",
        },
        projectId: {
            type: 'string',
            example: 'my-project',
            description: 'The ID of the project that contains this feature.',
        },
        strategies: {
            description: 'The strategies that apply to this feature.',
            type: 'array',
            items: {
                $ref: playgroundStrategySchema.$id,
            },
        },
        isEnabledInCurrentEnvironment: {
            type: 'boolean',
            description:
                'Whether the feature is active and would be evaluated in the provided environment in a normal SDK context.',
        },
        isEnabled: {
            description: `Whether this feature is enabled or not given the current strategies. Can be \`true\`, \`false\`, or \`${unknownFeatureEvaluationResult}\`. A feature will only be \`${unknownFeatureEvaluationResult}\` if Unleash does not recognize the strategy it uses (i.e. it's a custom strategy that Unleash doesn't have an implementation for) and all the strategy's constraints and segments (if any) are satisfied. Note that a strategy that Unleash doesn't have an implementation for can still be deemed false if it doesn't satisfy its constraints.`,
            anyOf: [
                { type: 'boolean', example: true },
                { type: 'string', enum: [unknownFeatureEvaluationResult] },
            ],
        },
        variant: {
            description:
                "The feature variant you receive based on the provided context or the _disabled variant_. If a feature is disabled or doesn't have any variants, you would get the _disabled variant_. Otherwise, you'll get one of the feature's defined variants.",
            type: 'object',
            additionalProperties: false,
            required: ['name', 'enabled'],
            properties: {
                name: {
                    type: 'string',
                    description:
                        "The variant's name. If there is no variant or if the toggle is disabled, this will be `disabled`",
                    example: 'red-variant',
                },
                enabled: {
                    type: 'boolean',
                    description:
                        "Whether the variant is enabled or not. If the feature is disabled or if it doesn't have variants, this property will be `false`",
                },
                payload: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['type', 'value'],
                    description: 'An optional payload attached to the variant.',
                    properties: {
                        type: {
                            description: 'The format of the payload.',
                            type: 'string',
                            enum: ['json', 'csv', 'string'],
                        },
                        value: {
                            type: 'string',
                            description: 'The payload value stringified.',
                            example: '{"property": "value"}',
                        },
                    },
                },
            },
            nullable: true,
            example: { name: 'green', enabled: true },
        },
        variants: { type: 'array', items: { $ref: variantSchema.$id } },
    },
    components: {
        schemas: {
            playgroundStrategySchema,
            playgroundConstraintSchema,
            playgroundSegmentSchema,
            parametersSchema,
            variantSchema,
            overrideSchema,
        },
        variants: { type: 'array', items: { $ref: variantSchema.$id } },
    },
} as const;

export type PlaygroundFeatureSchema = FromSchema<
    typeof playgroundFeatureSchema
>;
