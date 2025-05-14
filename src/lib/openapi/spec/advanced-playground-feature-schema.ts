import type { FromSchema } from 'json-schema-to-ts';
import { parametersSchema } from './parameters-schema.js';
import { variantSchema } from './variant-schema.js';
import { overrideSchema } from './override-schema.js';
import { playgroundStrategySchema } from './playground-strategy-schema.js';
import { playgroundConstraintSchema } from './playground-constraint-schema.js';
import { playgroundSegmentSchema } from './playground-segment-schema.js';
import { sdkContextSchema } from './sdk-context-schema.js';
import { advancedPlaygroundEnvironmentFeatureSchema } from './advanced-playground-environment-feature-schema.js';
import { sdkFlatContextSchema } from './sdk-flat-context-schema.js';

export const advancedPlaygroundFeatureSchema = {
    $id: '#/components/schemas/advancedPlaygroundFeatureSchema',
    description:
        'A simplified feature flag model intended for the Unleash playground.',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'projectId', 'environments'],
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
        environments: {
            type: 'object',
            description:
                'The lists of features that have been evaluated grouped by environment.',
            additionalProperties: {
                type: 'array',
                items: { $ref: advancedPlaygroundEnvironmentFeatureSchema.$id },
            },
        },
    },
    components: {
        schemas: {
            advancedPlaygroundEnvironmentFeatureSchema,
            playgroundStrategySchema,
            playgroundConstraintSchema,
            playgroundSegmentSchema,
            parametersSchema,
            variantSchema,
            overrideSchema,
            sdkContextSchema,
            sdkFlatContextSchema,
        },
    },
} as const;

export type AdvancedPlaygroundFeatureSchema = FromSchema<
    typeof advancedPlaygroundFeatureSchema
>;
