import type { FromSchema } from 'json-schema-to-ts';
import { sdkContextSchema } from './sdk-context-schema.js';
import { playgroundRequestSchema } from './playground-request-schema.js';
import { playgroundFeatureSchema } from './playground-feature-schema.js';
import { constraintSchema } from './constraint-schema.js';
import { parametersSchema } from './parameters-schema.js';
import { variantSchema } from './variant-schema.js';
import { overrideSchema } from './override-schema.js';
import { playgroundConstraintSchema } from './playground-constraint-schema.js';
import { playgroundSegmentSchema } from './playground-segment-schema.js';
import { playgroundStrategySchema } from './playground-strategy-schema.js';

export const playgroundResponseSchema = {
    $id: '#/components/schemas/playgroundResponseSchema',
    description: 'The state of all features given the provided input.',
    type: 'object',
    additionalProperties: false,
    required: ['features', 'input'],
    properties: {
        input: {
            description: 'The given input used to evaluate the features.',
            $ref: playgroundRequestSchema.$id,
        },
        features: {
            type: 'array',
            description: 'The list of features that have been evaluated.',
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
            variantSchema,
            overrideSchema,
        },
    },
} as const;

export type PlaygroundResponseSchema = FromSchema<
    typeof playgroundResponseSchema,
    { keepDefaultedPropertiesOptional: true }
>;
