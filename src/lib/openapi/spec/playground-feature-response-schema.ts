import type { FromSchema } from 'json-schema-to-ts';
import { sdkContextSchema } from './sdk-context-schema.js';
import { playgroundFeatureRequestSchema } from './playground-feature-request-schema.js';
import { playgroundFeatureSchema } from './playground-feature-schema.js';
import { constraintSchema } from './constraint-schema.js';
import { parametersSchema } from './parameters-schema.js';
import { variantSchema } from './variant-schema.js';
import { overrideSchema } from './override-schema.js';
import { playgroundConstraintSchema } from './playground-constraint-schema.js';
import { playgroundSegmentSchema } from './playground-segment-schema.js';
import { playgroundStrategySchema } from './playground-strategy-schema.js';

export const playgroundFeatureResponseSchema = {
    $id: '#/components/schemas/playgroundFeatureResponseSchema',
    description: 'The state of a single feature given the provided input.',
    type: 'object',
    additionalProperties: false,
    required: ['feature', 'input'],
    properties: {
        input: {
            description: 'The given input used to evaluate the feature.',
            $ref: playgroundFeatureRequestSchema.$id,
        },
        feature: {
            description: 'The evaluated feature.',
            $ref: playgroundFeatureSchema.$id,
        },
    },
    components: {
        schemas: {
            constraintSchema,
            parametersSchema,
            playgroundConstraintSchema,
            playgroundFeatureSchema,
            playgroundFeatureRequestSchema,
            playgroundSegmentSchema,
            playgroundStrategySchema,
            sdkContextSchema,
            variantSchema,
            overrideSchema,
        },
    },
} as const;

export type PlaygroundFeatureResponseSchema = FromSchema<
    typeof playgroundFeatureResponseSchema,
    { keepDefaultedPropertiesOptional: true }
>;
