import { FromSchema } from 'json-schema-to-ts';
import { sdkContextSchema } from './sdk-context-schema';
import { constraintSchema } from './constraint-schema';
import { parametersSchema } from './parameters-schema';
import { variantSchema } from './variant-schema';
import { overrideSchema } from './override-schema';
import { playgroundConstraintSchema } from './playground-constraint-schema';
import { playgroundSegmentSchema } from './playground-segment-schema';
import { playgroundStrategySchema } from './playground-strategy-schema';
import { advancedPlaygroundRequestSchema } from './advanced-playground-request-schema';
import { advancedPlaygroundFeatureSchema } from './advanced-playground-feature-schema';
import { advancedPlaygroundEnvironmentFeatureSchema } from './advanced-playground-environment-feature-schema';

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
            variantSchema,
            overrideSchema,
        },
    },
} as const;

export type AdvancedPlaygroundResponseSchema = FromSchema<
    typeof advancedPlaygroundResponseSchema
>;
