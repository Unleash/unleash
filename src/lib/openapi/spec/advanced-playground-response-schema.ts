import type { FromSchema } from 'json-schema-to-ts';
import { sdkContextSchema } from './sdk-context-schema.js';
import { constraintSchema } from './constraint-schema.js';
import { parametersSchema } from './parameters-schema.js';
import { variantSchema } from './variant-schema.js';
import { overrideSchema } from './override-schema.js';
import { playgroundConstraintSchema } from './playground-constraint-schema.js';
import { playgroundSegmentSchema } from './playground-segment-schema.js';
import { playgroundStrategySchema } from './playground-strategy-schema.js';
import { advancedPlaygroundRequestSchema } from './advanced-playground-request-schema.js';
import { advancedPlaygroundFeatureSchema } from './advanced-playground-feature-schema.js';
import { advancedPlaygroundEnvironmentFeatureSchema } from './advanced-playground-environment-feature-schema.js';
import { sdkFlatContextSchema } from './sdk-flat-context-schema.js';

export const advancedPlaygroundResponseSchema = {
    $id: '#/components/schemas/advancedPlaygroundResponseSchema',
    description: 'The state of all features given the provided input.',
    type: 'object',
    additionalProperties: false,
    required: ['features', 'input'],
    properties: {
        input: {
            description: 'The given input used to evaluate the features.',
            $ref: advancedPlaygroundRequestSchema.$id,
        },
        features: {
            type: 'array',
            description: 'The list of features that have been evaluated.',
            items: {
                $ref: advancedPlaygroundFeatureSchema.$id,
            },
        },
        warnings: {
            type: 'object',
            description: 'Warnings that occurred during evaluation.',
            properties: {
                invalidContextProperties: {
                    type: 'array',
                    description:
                        'A list of top-level context properties that were provided as input that are not valid due to being the wrong type.',
                    items: {
                        type: 'string',
                    },
                },
            },
        },
    },
    components: {
        schemas: {
            constraintSchema,
            parametersSchema,
            playgroundConstraintSchema,
            advancedPlaygroundFeatureSchema,
            advancedPlaygroundEnvironmentFeatureSchema,
            advancedPlaygroundRequestSchema,
            playgroundSegmentSchema,
            playgroundStrategySchema,
            sdkContextSchema,
            sdkFlatContextSchema,
            variantSchema,
            overrideSchema,
        },
    },
} as const;

export type AdvancedPlaygroundResponseSchema = FromSchema<
    typeof advancedPlaygroundResponseSchema,
    { keepDefaultedPropertiesOptional: true }
>;
