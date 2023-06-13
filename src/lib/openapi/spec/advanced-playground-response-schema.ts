import { FromSchema } from 'json-schema-to-ts';
import { sdkContextSchema } from './sdk-context-schema';
import { playgroundRequestSchema } from './playground-request-schema';
import { playgroundFeatureSchema } from './playground-feature-schema';
import { constraintSchema } from './constraint-schema';
import { parametersSchema } from './parameters-schema';
import { variantSchema } from './variant-schema';
import { overrideSchema } from './override-schema';
import { playgroundConstraintSchema } from './playground-constraint-schema';
import { playgroundSegmentSchema } from './playground-segment-schema';
import { playgroundStrategySchema } from './playground-strategy-schema';
import { advancedPlaygroundRequestSchema } from './advanced-playground-request-schema';

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
            advancedPlaygroundRequestSchema,
            playgroundSegmentSchema,
            playgroundStrategySchema,
            sdkContextSchema,
            variantSchema,
            overrideSchema,
        },
    },
} as const;

export type AdvancedPlaygroundResponseSchema = FromSchema<
    typeof advancedPlaygroundResponseSchema
>;
