import { FromSchema } from 'json-schema-to-ts';
import { constraintSchema } from './constraint-schema';
import { parametersSchema } from './parameters-schema';

const evalResults = ['enabled', 'disabled'] as const;

const resultsSchema = {
    type: 'string',
    enum: evalResults,
} as const;

export const playgroundConstraintSchema = {
    $id: '#/components/schemas/playgroundConstraintSchema',
    type: 'object',
    allOf: [
        { $ref: constraintSchema.$id },
        {
            required: ['result'],
            properties: {
                result: {
                    type: 'string',
                    enum: evalResults,
                },
            },
        },
    ],
    components: {
        schemas: {
            constraintSchema,
        },
    },
} as const;

export const playgroundSegmentSchema = {
    $id: '#/components/schemas/playgroundSegmentSchema',
    type: 'object',
    required: ['name', 'id', 'constraints', 'result'],
    properties: {
        id: {
            type: 'number',
        },
        name: {
            type: 'string',
        },
        result: resultsSchema,
        constraints: {
            type: 'array',
            items: { $ref: playgroundConstraintSchema.$id },
        },
    },
    components: {
        schemas: {
            playgroundConstraintSchema,
            constraintSchema,
        },
    },
} as const;

export const playgroundStrategySchema = {
    $id: '#/components/schemas/playgroundStrategySchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'id'],
    properties: {
        id: {
            type: 'string',
        },
        name: {
            type: 'string',
        },
        result: resultsSchema,
        segments: {
            type: 'array',
            items: {
                $ref: playgroundSegmentSchema.$id,
            },
        },
        constraints: {
            type: 'array',
            items: {
                $ref: playgroundConstraintSchema.$id,
            },
        },
        parameters: {
            $ref: parametersSchema.$id,
        },
    },
    components: {
        schemas: {
            constraintSchema,
            playgroundConstraintSchema,
            playgroundSegmentSchema,
            parametersSchema,
        },
    },
} as const;

export const playgroundFeatureSchema = {
    $id: '#/components/schemas/playgroundFeatureSchema',
    description:
        'A simplified feature toggle model intended for the Unleash playground.',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'projectId', 'isEnabled', 'variant', 'strategies'],
    properties: {
        name: { type: 'string', examples: ['my-feature'] },
        projectId: { type: 'string', examples: ['my-project'] },
        strategies: {
            type: 'array',
            items: {
                $ref: playgroundStrategySchema.$id,
            },
        },
        isEnabled: { type: 'boolean', examples: [true] },
        variant: {
            type: 'object',
            additionalProperties: false,
            required: ['name', 'enabled'],
            properties: {
                name: { type: 'string' },
                enabled: { type: 'boolean' },
                payload: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['type', 'value'],
                    properties: {
                        type: {
                            type: 'string',
                            enum: ['json', 'csv', 'string'],
                        },
                        value: { type: 'string' },
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
            constraintSchema,
            playgroundConstraintSchema,
            playgroundSegmentSchema,
            parametersSchema,
        },
    },
} as const;

export type PlaygroundFeatureSchema = FromSchema<
    typeof playgroundFeatureSchema
>;
