import { FromSchema } from 'json-schema-to-ts';
import { parametersSchema } from './parameters-schema';
import { variantSchema } from './variant-schema';
import { overrideSchema } from './override-schema';
import { playgroundStrategySchema } from './playground-strategy-schema';
import { playgroundConstraintSchema } from './playground-constraint-schema';
import { playgroundSegmentSchema } from './playground-segment-schema';
import { sdkContextSchema } from './sdk-context-schema';
import { advancedPlaygroundEnvironmentFeatureSchema } from './advanced-playground-environment-feature-schema';

export const advancedPlaygroundFeatureSchema = {
    $id: '#/components/schemas/advancedPlaygroundFeatureSchema',
    description:
        'A simplified feature toggle model intended for the Unleash playground.',
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
        },
    },
} as const;

export type AdvancedPlaygroundFeatureSchema = FromSchema<
    typeof advancedPlaygroundFeatureSchema
>;
