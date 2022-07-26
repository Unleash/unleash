import { FromSchema } from 'json-schema-to-ts';
import { constraintSchema, constraintSchemaBase } from './constraint-schema';
import { parametersSchema } from './parameters-schema';


const resultsSchema = {
    type: 'boolean',
} as const;

export const playgroundConstraintSchema = {
    $id: '#/components/schemas/playgroundConstraintSchema',
    additionalProperties: false,
    ...constraintSchemaBase,
    required: [...constraintSchemaBase.required, 'result'],
    properties: {
        ...constraintSchemaBase.properties,
        result: resultsSchema
    }
} as const;

export type PlaygroundConstraintSchema = FromSchema<typeof playgroundConstraintSchema>

export const playgroundSegmentSchema = {
    $id: '#/components/schemas/playgroundSegmentSchema',
    type: 'object',
    additionalProperties: false,
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
        },
    },
} as const;

export type PlaygroundSegmentSchema = FromSchema<typeof playgroundSegmentSchema>

export const playgroundStrategySchema = {
    $id: '#/components/schemas/playgroundStrategySchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'result'],
    properties: {
        name: {
            type: 'string',
        },
        result: {
            anyOf: [
                resultsSchema,
                { type: 'string', enum: ['not found']}
            ]
        },
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
            playgroundConstraintSchema,
            playgroundSegmentSchema,
            parametersSchema,
        },
    },
} as const;

export type PlaygroundStrategySchema = FromSchema<typeof playgroundStrategySchema>

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
        isEnabled: {
            anyOf: [
                { type: 'boolean', examples: [true] },
                { type: 'string', enum: ['unevaluated'] },
            ]
        },
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
            playgroundConstraintSchema,
            playgroundSegmentSchema,
            parametersSchema,
        },
    },
} as const;

export type PlaygroundFeatureSchema = FromSchema<
    typeof playgroundFeatureSchema
>;
