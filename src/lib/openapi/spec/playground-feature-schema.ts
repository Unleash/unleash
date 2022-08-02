import { FromSchema } from 'json-schema-to-ts';
import { constraintSchemaBase } from './constraint-schema';
import { parametersSchema } from './parameters-schema';

const resultsSchema = {
    description: 'Whether this was evaluated as true or false.',
    type: 'boolean',
} as const;

export const playgroundConstraintSchema = {
    $id: '#/components/schemas/playgroundConstraintSchema',
    additionalProperties: false,
    ...constraintSchemaBase,
    required: [...constraintSchemaBase.required, 'result'],
    properties: {
        ...constraintSchemaBase.properties,
        result: resultsSchema,
    },
} as const;

export type PlaygroundConstraintSchema = FromSchema<
    typeof playgroundConstraintSchema
>;

export const playgroundSegmentSchema = {
    $id: '#/components/schemas/playgroundSegmentSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'id', 'constraints', 'result'],
    properties: {
        id: {
            description: "The segment's id.",
            type: 'integer',
        },
        name: {
            description: 'The name of the segment.',
            example: 'segment A',
            type: 'string',
        },
        result: resultsSchema,
        constraints: {
            type: 'array',
            description: 'The list of constraints in this segment.',
            items: { $ref: playgroundConstraintSchema.$id },
        },
    },
    components: {
        schemas: {
            playgroundConstraintSchema,
        },
    },
} as const;

export type PlaygroundSegmentSchema = FromSchema<
    typeof playgroundSegmentSchema
>;

export const playgroundStrategyEvaluation = {
    evaluationComplete: 'complete',
    evaluationIncomplete: 'incomplete',
    unknownResult: 'unknown',
    incompleteEvaluationCauses: ['strategy not found'],
} as const;

export const playgroundStrategySchema = {
    $id: '#/components/schemas/playgroundStrategySchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'result', 'segments', 'constraints', 'parameters'],
    properties: {
        name: {
            description: "The strategy's name.",
            type: 'string',
        },
        id: {
            description: "The strategy's id.",
            type: 'string',
        },
        result: {
            description: "The strategy's evaluation result.",
            anyOf: [
                {
                    type: 'object',
                    additionalProperties: false,
                    required: ['evaluationStatus', 'enabled'],
                    properties: {
                        evaluationStatus: {
                            type: 'string',
                            description:
                                "Signals that this strategy could not be evaluated. This is most likely because you're using a custom strategy that Unleash doesn't know about.",
                            enum: [
                                playgroundStrategyEvaluation.evaluationIncomplete,
                            ],
                        },
                        reason: {
                            type: 'string',
                            description:
                                'The reason why this strategy could not be evaluated.',
                            enum: playgroundStrategyEvaluation.incompleteEvaluationCauses,
                        },
                        enabled: {
                            description:
                                "Whether this strategy resolves to `false` or if it might resolve to `true`. Because Unleash can't evaluate the strategy, it can't say for certain whether it will be `true`, but if you have failing constraints or segments, it _can_ determine that your strategy would be `false`.",
                            anyOf: [
                                { type: 'boolean', enum: [false] },
                                {
                                    type: 'string',
                                    enum: [
                                        playgroundStrategyEvaluation.unknownResult,
                                    ],
                                },
                            ],
                        },
                    },
                },
                {
                    type: 'object',
                    additionalProperties: false,
                    required: ['evaluationStatus', 'enabled'],
                    properties: {
                        evaluationStatus: {
                            description:
                                'Signals that this strategy was evaluated successfully.',
                            type: 'string',
                            enum: ['complete'],
                        },
                        enabled: {
                            type: 'boolean',
                            description:
                                'Whether this strategy evaluates to true or not.',
                        },
                    },
                },
            ],
        },
        segments: {
            type: 'array',
            description:
                "The strategy's segments and their evaluation results.",
            items: {
                $ref: playgroundSegmentSchema.$id,
            },
        },
        constraints: {
            type: 'array',
            description:
                "The strategy's constraints and their evaluation results.",
            items: {
                $ref: playgroundConstraintSchema.$id,
            },
        },
        parameters: {
            description:
                "The strategy's constraints and their evaluation results.",
            example: {
                myParam1: 'param value',
            },
            $ref: parametersSchema.$id,
        },
    },
    components: {
        schemas: {
            playgroundConstraintSchema,
            playgroundSegmentSchema,
            parametersSchema,
        },
    },
} as const;

export type PlaygroundStrategySchema = FromSchema<
    typeof playgroundStrategySchema
>;

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
        'strategies',
    ],
    properties: {
        name: {
            type: 'string',
            examples: ['my-feature'],
            description: "The feature's name.",
        },
        projectId: {
            type: 'string',
            examples: ['my-project'],
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
                { type: 'boolean', examples: [true] },
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
            examples: ['green'],
        },
    },
    components: {
        schemas: {
            playgroundStrategySchema,
            playgroundConstraintSchema,
            playgroundSegmentSchema,
            parametersSchema,
        },
    },
} as const;

export type PlaygroundFeatureSchema = FromSchema<
    typeof playgroundFeatureSchema
>;
