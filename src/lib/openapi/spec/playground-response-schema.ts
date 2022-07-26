import { FromSchema } from 'json-schema-to-ts';
import { sdkContextSchema } from './sdk-context-schema';
import { playgroundRequestSchema } from './playground-request-schema';
import {
    playgroundConstraintSchema,
    playgroundFeatureSchema,
    playgroundSegmentSchema,
    playgroundStrategySchema,
} from './playground-feature-schema';
import { constraintSchema } from './constraint-schema';
import { parametersSchema } from './parameters-schema';

export const playgroundResponseSchema = {
    $id: '#/components/schemas/playgroundResponseSchema',
    description: 'The state of all features given the provided input.',
    type: 'object',
    additionalProperties: false,
    required: ['features', 'input'],
    properties: {
        input: {
            $ref: playgroundRequestSchema.$id,
        },
        features: {
            type: 'array',
            items: {
                $ref: playgroundFeatureSchema.$id,
            },
        },
    },
    components: {
        schemas: {
            constraintSchema,
            parametersSchema,
            playgroundConstraintSchema,
            playgroundFeatureSchema,
            playgroundRequestSchema,
            playgroundSegmentSchema,
            playgroundStrategySchema,
            sdkContextSchema,
        },
    },
} as const;

export type PlaygroundResponseSchema = FromSchema<
    typeof playgroundResponseSchema
>;
